package com.pathwise.service;

import com.pathwise.ai.AiProvider;
import com.pathwise.domain.*;
import com.pathwise.dto.ResumeAnalysisResponse;
import com.pathwise.dto.RoadmapTemplateDto;
import com.pathwise.engine.RoadmapTemplateService;
import com.pathwise.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeAnalyzerService {

    private final AiProvider aiProvider;
    private final RoadmapTemplateService roadmapTemplateService;
    private final RoadmapRepository roadmapRepository;
    private final MilestoneRepository milestoneRepository;
    private final RoadmapItemRepository roadmapItemRepository;
    private final CatalogItemRepository catalogItemRepository;
    private final LearnerProfileRepository profileRepository;

    // Standard Curricula for Target Roles
    private static final Map<String, List<String>> ROLE_CURRICULA = new LinkedHashMap<>();
    private static final Map<String, int[]> SALARY_BENCHMARKS = new HashMap<>();

    static {
        ROLE_CURRICULA.put("DevOps Engineer", List.of(
                "Linux", "Git", "Docker", "Kubernetes", "CI/CD", "Terraform", "AWS", "GitHub Actions", "Prometheus", "Grafana", "System Design"
        ));
        ROLE_CURRICULA.put("Full Stack Developer", List.of(
                "HTML", "CSS", "JavaScript", "TypeScript", "React", "Node.js", "Express", "REST APIs", "SQL", "PostgreSQL", "Docker", "Git", "CI/CD"
        ));
        ROLE_CURRICULA.put("Backend Developer", List.of(
                "Java", "Spring Boot", "SQL", "PostgreSQL", "REST APIs", "Microservices", "Docker", "Redis", "Kafka", "Git", "System Design"
        ));
        ROLE_CURRICULA.put("Frontend Developer", List.of(
                "HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS", "Redux", "REST APIs", "Web Performance", "Git"
        ));
        ROLE_CURRICULA.put("AI Engineer", List.of(
                "Python", "NumPy", "Pandas", "Machine Learning", "Deep Learning", "PyTorch", "LLMs", "Embeddings", "LangChain", "Vector Databases", "RAG"
        ));
        ROLE_CURRICULA.put("Cloud & Platform Architect", List.of(
                "AWS", "Cloud Architecture", "Docker", "Kubernetes", "Terraform", "Microservices", "Security & IAM", "CI/CD", "High Availability"
        ));

        // [Base Min, Base Max, Target Min, Target Max]
        SALARY_BENCHMARKS.put("DevOps Engineer", new int[]{75000, 95000, 130000, 160000});
        SALARY_BENCHMARKS.put("Full Stack Developer", new int[]{70000, 88000, 120000, 145000});
        SALARY_BENCHMARKS.put("Backend Developer", new int[]{72000, 90000, 125000, 150000});
        SALARY_BENCHMARKS.put("Frontend Developer", new int[]{65000, 82000, 110000, 135000});
        SALARY_BENCHMARKS.put("AI Engineer", new int[]{85000, 105000, 145000, 185000});
        SALARY_BENCHMARKS.put("Cloud & Platform Architect", new int[]{90000, 115000, 155000, 195000});
    }

    private static final List<String> KNOWN_TECH_DICTIONARY = List.of(
            "HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Vue", "Angular", "Tailwind CSS", "Sass",
            "Node.js", "Express", "NestJS", "Python", "Django", "FastAPI", "Java", "Spring Boot", "C#", ".NET", "Go", "Golang", "Rust",
            "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Prisma", "Hibernate", "GraphQL", "REST APIs",
            "Docker", "Kubernetes", "CI/CD", "GitHub Actions", "Terraform", "AWS", "Azure", "GCP", "Linux", "Git", "Microservices",
            "Kafka", "RabbitMQ", "Prometheus", "Grafana", "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "Pandas",
            "NumPy", "LLMs", "LangChain", "Vector Databases", "RAG", "System Design", "Agile", "Scrum", "Jest", "Playwright", "Webpack", "Vite"
    );

    /**
     * Extract text from uploaded PDF file using Apache PDFBox
     */
    public String extractTextFromPdf(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return "";
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            return stripper.getText(document);
        } catch (Exception e) {
            log.warn("Failed to parse PDF with PDFBox: {}", e.getMessage());
            return new String(file.getBytes());
        }
    }

    /**
     * Extract skills from resume text using both regex keyword matching and Gemini AI
     */
    public List<String> extractSkills(String resumeText) {
        if (resumeText == null || resumeText.isBlank()) return Collections.emptyList();

        Set<String> detected = new LinkedHashSet<>();
        String normalizedText = " " + resumeText.replaceAll("[^a-zA-Z0-9+#./-]", " ") + " ";

        // 1. Dictionary Matching (Fast & Reliable)
        for (String tech : KNOWN_TECH_DICTIONARY) {
            String escaped = Pattern.quote(tech);
            Pattern p = Pattern.compile("(?i)(?<=\\s)" + escaped + "(?=\\s|[.,;])");
            Matcher m = p.matcher(normalizedText);
            if (m.find()) {
                detected.add(tech);
            }
        }

        // 2. Gemini AI Deep Semantic Skill Extraction (if available)
        try {
            String prompt = "Extract all technical and engineering skills from the following resume text as a comma-separated list:\n\n" 
                    + (resumeText.length() > 2500 ? resumeText.substring(0, 2500) : resumeText);
            String aiResult = aiProvider.generateText(prompt);
            if (aiResult != null && !aiResult.isBlank()) {
                String[] parts = aiResult.split("[,\\n]+");
                for (String part : parts) {
                    String clean = part.replaceAll("[*•\\-_]", "").trim();
                    if (!clean.isBlank() && clean.length() < 30) {
                        // Find matching dictionary case if possible
                        String match = KNOWN_TECH_DICTIONARY.stream()
                                .filter(k -> k.equalsIgnoreCase(clean))
                                .findFirst()
                                .orElse(clean);
                        detected.add(match);
                    }
                }
            }
        } catch (Exception e) {
            log.debug("AI extraction fallback to dictionary matching: {}", e.getMessage());
        }

        return new ArrayList<>(detected);
    }

    /**
     * Analyze gap between extracted skills and target career role
     */
    public ResumeAnalysisResponse analyzeResume(String targetRoleInput, String resumeText, User user) {
        String targetRole = resolveTargetRole(targetRoleInput);
        List<String> extractedSkills = extractSkills(resumeText);
        List<String> requiredSkills = ROLE_CURRICULA.getOrDefault(targetRole, ROLE_CURRICULA.get("Full Stack Developer"));

        // Normalize matching
        Set<String> normalizedExtracted = extractedSkills.stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String req : requiredSkills) {
            if (normalizedExtracted.contains(req.toLowerCase()) || hasFuzzyMatch(req, normalizedExtracted)) {
                matched.add(req);
            } else {
                missing.add(req);
            }
        }

        int total = requiredSkills.size();
        int matchScore = total > 0 ? (int) Math.round(((double) matched.size() / total) * 100) : 40;
        matchScore = Math.max(15, Math.min(95, matchScore));

        // Time to target calculation
        int missingCount = Math.max(1, missing.size());
        int estimatedHours = missingCount * 10;
        double estimatedWeeks = Math.max(1.0, Math.round((estimatedHours / 10.0) * 10.0) / 10.0);

        // Salary Metrics
        int[] salary = SALARY_BENCHMARKS.getOrDefault(targetRole, new int[]{70000, 85000, 120000, 145000});
        int currentMid = (salary[0] + salary[1]) / 2;
        int targetMid = (salary[2] + salary[3]) / 2;
        int diffPercent = (int) Math.round(((double) (targetMid - currentMid) / currentMid) * 100);

        String currentSalaryStr = String.format("$%dk - $%dk", salary[0] / 1000, salary[1] / 1000);
        String targetSalaryStr = String.format("$%dk - $%dk", salary[2] / 1000, salary[3] / 1000);
        String increaseStr = "+" + diffPercent + "% Avg Jump";

        // Executive Summary
        String executiveSummary = generateSummary(targetRole, matched, missing, estimatedWeeks, increaseStr);

        return ResumeAnalysisResponse.builder()
                .targetRole(targetRole)
                .matchScore(matchScore)
                .extractedSkills(extractedSkills)
                .matchedSkills(matched)
                .missingSkills(missing)
                .estimatedWeeksToTarget(estimatedWeeks)
                .estimatedHoursToTarget(estimatedHours)
                .currentEstimatedSalary(currentSalaryStr)
                .targetEstimatedSalary(targetSalaryStr)
                .salaryIncreasePercent(increaseStr)
                .executiveSummary(executiveSummary)
                .build();
    }

    /**
     * Synthesize and activate a customized Bridge Roadmap with existing skills pre-credited as COMPLETED
     */
    @Transactional
    public Roadmap createBridgeRoadmap(User user, String targetRoleInput, List<String> existingSkills) {
        String targetRole = resolveTargetRole(targetRoleInput);
        Set<String> masteredSet = existingSkills.stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        // Update profile
        LearnerProfile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    LearnerProfile p = new LearnerProfile();
                    p.setUser(user);
                    return p;
                });
        profile.setGoal(targetRole);
        profile.setCurrentSkills(String.join(",", existingSkills));
        profileRepository.save(profile);

        Roadmap roadmap;
        Optional<RoadmapTemplateDto> optTemplate = roadmapTemplateService.findBestMatch(targetRole, String.join(",", existingSkills));
        if (optTemplate.isPresent()) {
            roadmap = roadmapTemplateService.buildRoadmapFromTemplate(optTemplate.get(), user, profile);
            roadmap.setTitle("Bridge: " + targetRole);
            roadmap = roadmapRepository.save(roadmap);

            boolean firstPendingFound = false;

            if (roadmap.getMilestones() != null) {
                for (Milestone m : roadmap.getMilestones()) {
                    if (m.getItems() != null) {
                        for (RoadmapItem item : m.getItems()) {
                            String title = item.getCatalogItem() != null ? item.getCatalogItem().getTitle() : "";
                            boolean isMastered = isTitleOrSkillMastered(title, masteredSet);

                            if (isMastered) {
                                item.setStatus("COMPLETED");
                            } else if (!firstPendingFound) {
                                item.setStatus("IN_PROGRESS");
                                firstPendingFound = true;
                            } else {
                                item.setStatus("NOT_STARTED");
                            }
                            roadmapItemRepository.save(item);
                        }
                    }
                }
            }
        } else {
            // Fallback default 3-phase Bridge roadmap
            roadmap = new Roadmap();
            roadmap.setUser(user);
            roadmap.setTitle("Bridge: " + targetRole);
            roadmap = roadmapRepository.save(roadmap);
            createFallbackBridgeMilestones(roadmap, targetRole, masteredSet);
        }

        return roadmap;
    }

    private boolean isTitleOrSkillMastered(String title, Set<String> masteredSet) {
        if (title == null || title.isBlank()) return false;
        String lowerTitle = title.toLowerCase();
        for (String mastered : masteredSet) {
            if (lowerTitle.contains(mastered.toLowerCase())) {
                return true;
            }
        }
        return false;
    }

    private void createFallbackBridgeMilestones(Roadmap roadmap, String targetRole, Set<String> masteredSet) {
        List<String> required = ROLE_CURRICULA.getOrDefault(targetRole, ROLE_CURRICULA.get("Full Stack Developer"));
        
        Milestone m1 = new Milestone();
        m1.setRoadmap(roadmap);
        m1.setTitle("Phase 1: Bridge Foundations");
        m1.setDescription("Close introductory gaps for " + targetRole);
        m1.setOrderIndex(1);
        m1 = milestoneRepository.save(m1);

        int idx = 0;
        for (String skill : required) {
            RoadmapItem item = new RoadmapItem();
            item.setMilestone(m1);
            item.setOrderIndex(idx++);
            boolean mastered = masteredSet.contains(skill.toLowerCase());
            item.setStatus(mastered ? "COMPLETED" : (idx == 1 ? "IN_PROGRESS" : "NOT_STARTED"));
            item.setAiExplanation("Core prerequisite for " + targetRole);

            CatalogItem ci = new CatalogItem();
            ci.setTitle("Mastering " + skill);
            ci.setDescription("Essential competency for " + targetRole + " roles.");
            ci.setFormat(idx == 1 ? "PROJECT" : "course");
            ci.setDifficulty("intermediate");
            ci.setEstimatedHours(java.math.BigDecimal.valueOf(6.0));
            ci.setUrl("https://roadmap.sh");
            ci = catalogItemRepository.save(ci);

            item.setCatalogItem(ci);
            roadmapItemRepository.save(item);
        }
    }

    private String resolveTargetRole(String input) {
        if (input == null || input.isBlank()) return "Full Stack Developer";
        String lower = input.toLowerCase().trim();
        for (String key : ROLE_CURRICULA.keySet()) {
            if (lower.contains(key.toLowerCase()) || key.toLowerCase().contains(lower)) {
                return key;
            }
        }
        if (lower.contains("devops") || lower.contains("sre") || lower.contains("cloud")) return "DevOps Engineer";
        if (lower.contains("full") || lower.contains("stack")) return "Full Stack Developer";
        if (lower.contains("back") || lower.contains("java") || lower.contains("spring")) return "Backend Developer";
        if (lower.contains("front") || lower.contains("react") || lower.contains("ui")) return "Frontend Developer";
        if (lower.contains("ai") || lower.contains("ml") || lower.contains("data") || lower.contains("machine")) return "AI Engineer";
        return "Full Stack Developer";
    }

    private boolean hasFuzzyMatch(String target, Set<String> candidateSet) {
        String t = target.toLowerCase();
        for (String c : candidateSet) {
            if (c.contains(t) || t.contains(c)) return true;
        }
        return false;
    }

    private String generateSummary(String targetRole, List<String> matched, List<String> missing, double weeks, String increaseStr) {
        String matchedList = matched.isEmpty() ? "general coding foundations" : String.join(", ", matched.subList(0, Math.min(4, matched.size())));
        String missingList = missing.isEmpty() ? "advanced portfolio polishing" : String.join(", ", missing.subList(0, Math.min(3, missing.size())));

        return String.format(
                "You have verified mastery in **%s**, covering the primary baseline. " +
                "To qualify for senior **%s** positions, you only need to bridge %d key competencies: **%s**. " +
                "Completing this accelerated bridge path in **~%.1f weeks** opens roles offering an estimated **%s**.",
                matchedList, targetRole, missing.size(), missingList, weeks, increaseStr
        );
    }
}
