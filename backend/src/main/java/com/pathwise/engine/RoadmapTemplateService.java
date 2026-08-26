package com.pathwise.engine;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pathwise.domain.*;
import com.pathwise.dto.RoadmapTemplateDto;
import com.pathwise.repository.CatalogItemRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RoadmapTemplateService {

    private static final Logger log = LoggerFactory.getLogger(RoadmapTemplateService.class);

    private final ObjectMapper objectMapper;
    private final CatalogItemRepository catalogItemRepository;

    private List<RoadmapTemplateDto> templateCatalog = new ArrayList<>();
    private final Map<String, RoadmapTemplateDto> slugIndex = new HashMap<>();

    public RoadmapTemplateService(ObjectMapper objectMapper, CatalogItemRepository catalogItemRepository) {
        this.objectMapper = objectMapper;
        this.catalogItemRepository = catalogItemRepository;
    }

    @PostConstruct
    public void loadCatalog() {
        try {
            ClassPathResource resource = new ClassPathResource("data/roadmaps_catalog.json");
            if (resource.exists()) {
                try (InputStream is = resource.getInputStream()) {
                    List<RoadmapTemplateDto> templates = objectMapper.readValue(is, new TypeReference<List<RoadmapTemplateDto>>() {});
                    this.templateCatalog = templates;
                    for (RoadmapTemplateDto t : templates) {
                        if (t.getId() != null) slugIndex.put(t.getId().toLowerCase().trim(), t);
                        if (t.getSlug() != null) slugIndex.put(t.getSlug().toLowerCase().trim(), t);
                    }
                    log.info("Successfully loaded {} curated roadmap templates into PathWise catalog.", templates.size());
                }
            } else {
                log.warn("Roadmap catalog file data/roadmaps_catalog.json not found in classpath.");
            }
        } catch (Exception e) {
            log.error("Failed to load roadmap templates catalog: {}", e.getMessage());
        }
    }

    public List<RoadmapTemplateDto> getAllTemplates() {
        return Collections.unmodifiableList(templateCatalog);
    }

    public Optional<RoadmapTemplateDto> findBestMatch(String goal, String currentSkillsJson) {
        if (goal == null || goal.isBlank() || templateCatalog.isEmpty()) {
            return Optional.empty();
        }

        String cleanGoal = goal.toLowerCase().trim().replaceAll("[^a-z0-9\\s-]", "");

        // 1. Direct Slug / ID match
        String targetSlug = cleanGoal.replace(" ", "-");
        if (slugIndex.containsKey(targetSlug)) {
            return Optional.of(slugIndex.get(targetSlug));
        }

        // 2. Token / Semantic Score Matching
        Set<String> goalTokens = Arrays.stream(cleanGoal.split("\\s+"))
                .filter(t -> t.length() > 2 && !isStopWord(t))
                .collect(Collectors.toSet());

        Set<String> userSkills = new HashSet<>();
        if (currentSkillsJson != null && !currentSkillsJson.isBlank() && !currentSkillsJson.equals("[]")) {
            try {
                List<String> parsed = objectMapper.readValue(currentSkillsJson, new TypeReference<List<String>>() {});
                userSkills.addAll(parsed.stream().map(String::toLowerCase).collect(Collectors.toSet()));
            } catch (Exception ignored) {}
        }

        RoadmapTemplateDto bestTemplate = null;
        double bestScore = 0.0;

        for (RoadmapTemplateDto template : templateCatalog) {
            double score = computeMatchScore(template, cleanGoal, goalTokens, userSkills);
            if (score > bestScore) {
                bestScore = score;
                bestTemplate = template;
            }
        }

        if (bestScore >= 0.45 && bestTemplate != null) {
            log.info("Matched goal '{}' to curated roadmap template '{}' with confidence score {}", 
                    goal, bestTemplate.getName(), Math.round(bestScore * 100) / 100.0);
            return Optional.of(bestTemplate);
        }

        return Optional.empty();
    }

    private double computeMatchScore(RoadmapTemplateDto t, String cleanGoal, Set<String> goalTokens, Set<String> userSkills) {
        double score = 0.0;
        String tName = t.getName() != null ? t.getName().toLowerCase() : "";
        String tRole = t.getRole() != null ? t.getRole().toLowerCase() : "";
        String tSlug = t.getSlug() != null ? t.getSlug().toLowerCase() : "";

        // Exact name or role containment
        if (cleanGoal.contains(tName) || tName.contains(cleanGoal)) {
            score += 0.85;
        }
        if (cleanGoal.contains(tRole) || tRole.contains(cleanGoal)) {
            score += 0.85;
        }
        if (cleanGoal.contains(tSlug)) {
            score += 0.90;
        }

        // Token overlap
        Set<String> templateTokens = Arrays.stream((tName + " " + tRole + " " + tSlug).split("[\\s-]+"))
                .filter(tk -> tk.length() > 2 && !isStopWord(tk))
                .collect(Collectors.toSet());

        long commonTokens = goalTokens.stream().filter(templateTokens::contains).count();
        if (!goalTokens.isEmpty()) {
            score += ((double) commonTokens / goalTokens.size()) * 0.60;
        }

        // Skill list overlap
        if (t.getSkills() != null && !userSkills.isEmpty()) {
            long skillMatches = t.getSkills().stream()
                    .map(String::toLowerCase)
                    .filter(userSkills::contains)
                    .count();
            score += ((double) skillMatches / t.getSkills().size()) * 0.35;
        }

        return Math.min(1.0, score);
    }

    public Roadmap buildRoadmapFromTemplate(RoadmapTemplateDto template, User user, LearnerProfile profile) {
        Roadmap roadmap = new Roadmap();
        roadmap.setUser(user);
        roadmap.setTitle(template.getName() != null ? template.getName() : "Curated Career Roadmap");
        roadmap.setStatus("ACTIVE");

        List<String> rawSkills = template.getSkills() != null ? template.getSkills() : List.of("Fundamentals", "Core Frameworks", "Production");
        int totalSkills = rawSkills.size();

        // Partition into 3 topological milestones
        int chunkSize = Math.max(1, (int) Math.ceil((double) totalSkills / 3.0));
        Set<Milestone> milestones = new LinkedHashSet<>();

        int milestoneIdx = 1;
        for (int i = 0; i < totalSkills; i += chunkSize) {
            int end = Math.min(i + chunkSize, totalSkills);
            List<String> phaseSkills = rawSkills.subList(i, end);

            String phaseTitle = switch (milestoneIdx) {
                case 1 -> "Phase 1: Foundations & Core Prerequisites";
                case 2 -> "Phase 2: Modern Frameworks & Architecture Integration";
                default -> "Phase 3: Production Engineering, Testing & Best Practices";
            };

            String phaseDesc = switch (milestoneIdx) {
                case 1 -> "Master core syntax, foundational mental models, and hands-on starter implementations.";
                case 2 -> "Build comprehensive Single Page Applications, system components, and API integrations.";
                default -> "Scale with automated testing, performance optimizations, and industry deployment standards.";
            };

            Milestone milestone = new Milestone();
            milestone.setRoadmap(roadmap);
            milestone.setTitle(phaseTitle);
            milestone.setDescription(phaseDesc);
            milestone.setOrderIndex(milestoneIdx);

            Set<RoadmapItem> items = new LinkedHashSet<>();
            int itemOrder = 1;

            for (int sIdx = 0; sIdx < phaseSkills.size(); sIdx++) {
                String skill = phaseSkills.get(sIdx);
                CatalogItem catalogItem = getOrCreateCatalogItemForSkill(skill, template, milestoneIdx, sIdx == 0 && milestoneIdx == 1);

                RoadmapItem item = new RoadmapItem();
                item.setMilestone(milestone);
                item.setCatalogItem(catalogItem);
                item.setOrderIndex(itemOrder++);
                item.setStatus(milestoneIdx == 1 && sIdx == 0 ? "IN_PROGRESS" : "TODO");
                item.setAiExplanation(generateSkillExplanation(skill, template.getName(), milestoneIdx));

                items.add(item);
            }

            milestone.setItems(items);
            milestones.add(milestone);
            milestoneIdx++;
        }

        roadmap.setMilestones(milestones);
        return roadmap;
    }

    private CatalogItem getOrCreateCatalogItemForSkill(String skill, RoadmapTemplateDto template, int phaseIdx, boolean isFirstProject) {
        String title = isFirstProject 
                ? "Hands-on Project: " + skill + " Starter Architecture" 
                : "Mastering " + skill;

        String description = isFirstProject
                ? "Immediate hands-on project to build foundational momentum and cut early drop-off."
                : "Comprehensive modules, practical implementation patterns, and core competencies for " + skill + ".";

        String difficulty = switch (phaseIdx) {
            case 1 -> "beginner";
            case 2 -> "intermediate";
            default -> "advanced";
        };

        CatalogItem item = new CatalogItem();
        item.setTitle(title);
        item.setDescription(description);
        item.setFormat(isFirstProject ? "project" : "course");
        item.setEstimatedHours(BigDecimal.valueOf(isFirstProject ? 6.0 : (phaseIdx == 1 ? 8.0 : 12.0)));
        item.setProvider(template.getSource() != null ? "PathWise (" + template.getSource() + ")" : "PathWise Academy");
        item.setDifficulty(difficulty);
        item.setUrl(template.getUrl() != null ? template.getUrl() : "https://roadmap.sh");

        return catalogItemRepository.save(item);
    }

    private String generateSkillExplanation(String skill, String roadmapName, int phase) {
        return switch (phase) {
            case 1 -> "Essential foundational prerequisite for " + roadmapName + ". Establishes core syntax, mental models, and project readiness.";
            case 2 -> "Core competency for " + roadmapName + ". Connects foundational knowledge to real-world application architecture.";
            default -> "Advanced production standard for " + roadmapName + ". Ensures high performance, reliability, and enterprise scale.";
        };
    }

    private boolean isStopWord(String s) {
        return Set.of("the", "and", "for", "with", "how", "become", "want", "learn", "roadmap", "guide", "step").contains(s);
    }
}
