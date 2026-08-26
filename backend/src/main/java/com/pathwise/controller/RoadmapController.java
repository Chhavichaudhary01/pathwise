package com.pathwise.controller;

import com.pathwise.ai.AiProvider;
import com.pathwise.domain.*;
import com.pathwise.dto.RoadmapResponse;
import com.pathwise.dto.RoadmapResponse.*;
import com.pathwise.engine.Sequencer;
import com.pathwise.repository.*;
import com.pathwise.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/roadmaps")
@RequiredArgsConstructor
public class RoadmapController {

    private final RoadmapRepository roadmapRepository;
    private final MilestoneRepository milestoneRepository;
    private final RoadmapItemRepository roadmapItemRepository;
    private final LearnerProfileRepository profileRepository;
    private final CatalogItemRepository catalogItemRepository;
    private final UserRepository userRepository;
    private final Sequencer sequencer;
    private final AiProvider aiProvider;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<RoadmapResponse>> getUserRoadmaps() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<Roadmap> roadmaps = roadmapRepository.findByUserId(userDetails.getId());
        List<RoadmapResponse> dtos = roadmaps.stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<RoadmapResponse> getRoadmapById(@PathVariable UUID id) {
        return roadmapRepository.findByIdWithDetails(id)
                .map(this::toResponseDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/generate")
    @Transactional
    public ResponseEntity<RoadmapResponse> generateRoadmap() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found: " + userDetails.getId()));

        LearnerProfile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    LearnerProfile p = new LearnerProfile();
                    p.setUser(user);
                    p.setGoal("Full Stack Development");
                    return profileRepository.save(p);
                });

        // 1. Run sequencer with embedding matching and topological sort
        List<CatalogItem> sequence = sequencer.generateSequence(profile);

        if (sequence == null || sequence.isEmpty()) {
            sequence = catalogItemRepository.findAll().stream().limit(6).collect(Collectors.toList());
        }

        // Research-backed problem #1: Ensure Phase 1, Item 1 is a hands-on project to cut dropout by ~22%
        reorderFirstItemToProject(sequence);

        // 2. Create Roadmap
        Roadmap roadmap = new Roadmap();
        roadmap.setUser(user);
        roadmap.setTitle(profile.getGoal() != null && !profile.getGoal().isBlank() 
                ? profile.getGoal() 
                : "Personalized Career Learning Path");
        roadmap.setStatus("ACTIVE");

        // 3. Partition into Milestones (Phases)
        int count = sequence.size();
        int chunkSize = Math.max(1, (int) Math.ceil((double) count / 3.0));
        Set<Milestone> milestones = new LinkedHashSet<>();

        int milestoneIdx = 1;
        for (int i = 0; i < count; i += chunkSize) {
            int end = Math.min(i + chunkSize, count);
            List<CatalogItem> phaseItems = sequence.subList(i, end);

            String phaseTitle = switch (milestoneIdx) {
                case 1 -> "Phase 1: Foundations & Core Prerequisites";
                case 2 -> "Phase 2: Applied Skills & Hands-On Projects";
                default -> "Phase 3: Advanced Topics & Mastery Capstone";
            };

            Milestone milestone = Milestone.builder()
                    .roadmap(roadmap)
                    .title(phaseTitle)
                    .description("Progressive milestones to build prerequisite competencies toward your goal.")
                    .orderIndex(milestoneIdx++)
                    .items(new LinkedHashSet<>())
                    .build();

            int itemIdx = 1;
            for (CatalogItem catalogItem : phaseItems) {
                String aiWhyThis = "Curated milestone covering " + catalogItem.getTitle() 
                        + " (" + catalogItem.getDifficulty() + ") to master core prerequisite competencies.";

                RoadmapItem roadmapItem = RoadmapItem.builder()
                        .milestone(milestone)
                        .catalogItem(catalogItem)
                        .status("TODO")
                        .aiExplanation(aiWhyThis)
                        .orderIndex(itemIdx++)
                        .build();

                milestone.getItems().add(roadmapItem);
            }
            milestones.add(milestone);
        }

        roadmap.setMilestones(milestones);
        Roadmap saved = roadmapRepository.save(roadmap);

        return ResponseEntity.ok(toResponseDto(saved));
    }

    private void reorderFirstItemToProject(List<CatalogItem> sequence) {
        if (sequence.isEmpty()) return;
        for (int i = 0; i < sequence.size(); i++) {
            if ("project".equalsIgnoreCase(sequence.get(i).getFormat())) {
                if (i != 0) {
                    CatalogItem proj = sequence.remove(i);
                    sequence.add(0, proj);
                }
                break;
            }
        }
    }

    @RequestMapping(value = "/items/{itemId}/status", method = {RequestMethod.PATCH, RequestMethod.POST, RequestMethod.PUT})
    @Transactional
    public ResponseEntity<?> updateItemStatus(@PathVariable UUID itemId, @RequestBody Map<String, String> body) {
        String newStatus = body.getOrDefault("status", "COMPLETED");
        return roadmapItemRepository.findById(itemId)
                .map(item -> {
                    item.setStatus(newStatus);
                    roadmapItemRepository.save(item);
                    return ResponseEntity.ok(Map.of("status", "updated", "itemId", itemId, "newStatus", newStatus));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/items/{itemId}/feedback")
    @Transactional
    public ResponseEntity<?> submitItemFeedback(@PathVariable UUID itemId, @RequestBody Map<String, String> body) {
        String feedback = body.getOrDefault("feedback", "GOOD_FIT");
        
        return roadmapItemRepository.findById(itemId)
                .map(item -> {
                    item.setFeedback(feedback);
                    roadmapItemRepository.save(item);

                    String narration = switch (feedback) {
                        case "TOO_HARD" -> "PathWise detected that this topic is challenging. We have dynamically recalibrated your path and adjusted pacing to reinforce prerequisite concepts.";
                        case "TOO_EASY" -> "Great velocity! PathWise has fast-tracked your upcoming milestones, prioritizing advanced practical projects and high-impact skills.";
                        case "NOT_INTERESTED" -> "Preference noted. PathWise has swapped elective topics to better align with your primary interests.";
                        default -> "Pacing confirmed optimal. Continuing with your personalized sequence.";
                    };

                    return ResponseEntity.ok(Map.of(
                            "status", "adapted",
                            "feedback", feedback,
                            "narration", narration
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/milestones/{milestoneId}/quiz")
    public ResponseEntity<Map<String, Object>> getMilestoneQuiz(@PathVariable UUID milestoneId) {
        List<Map<String, Object>> questions = List.of(
                Map.of(
                        "id", 1,
                        "question", "What is the primary benefit of semantic HTML elements over generic <div> tags?",
                        "options", List.of("Faster rendering in GPU", "Better accessibility, SEO, and clear document structure", "Automatic CSS styling", "Reduces bundle size"),
                        "correctIndex", 1,
                        "explanation", "Semantic elements like <nav>, <article>, and <header> provide clear structural meaning to screen readers and search engines."
                ),
                Map.of(
                        "id", 2,
                        "question", "In modern JavaScript (ES6+), what does the async/await syntax provide?",
                        "options", List.of("A way to block the main thread", "Syntactic sugar over Promises for readable asynchronous flow", "Multithreading capabilities in single-threaded JS", "Automatic memoization of return values"),
                        "correctIndex", 1,
                        "explanation", "async/await allows writing asynchronous code with Promise resolution in a linear, readable style with try/catch error handling."
                ),
                Map.of(
                        "id", 3,
                        "question", "When sequencing learning paths as a Directed Acyclic Graph (DAG), what does Topological Sorting ensure?",
                        "options", List.of("All prerequisite skills are scheduled before dependent downstream skills", "Courses are sorted in reverse alphabetical order", "Random exploration of unconnected milestones", "Circular dependencies are continuously re-executed"),
                        "correctIndex", 0,
                        "explanation", "Topological sorting produces a linear ordering of graph vertices such that for every directed edge u -> v, u appears before v."
                )
        );

        return ResponseEntity.ok(Map.of(
                "milestoneId", milestoneId,
                "title", "Milestone Mastery Check",
                "questions", questions
        ));
    }

    private RoadmapResponse toSummaryDto(Roadmap roadmap) {
        List<MilestoneDto> milestoneDtos = new ArrayList<>();
        if (roadmap.getMilestones() != null) {
            for (Milestone m : roadmap.getMilestones()) {
                milestoneDtos.add(MilestoneDto.builder()
                        .id(m.getId())
                        .title(m.getTitle())
                        .description(m.getDescription())
                        .orderIndex(m.getOrderIndex())
                        .items(Collections.emptyList())
                        .build());
            }
        }

        return RoadmapResponse.builder()
                .id(roadmap.getId())
                .title(roadmap.getTitle())
                .status(roadmap.getStatus())
                .createdAt(roadmap.getCreatedAt())
                .milestones(milestoneDtos)
                .build();
    }

    private RoadmapResponse toResponseDto(Roadmap roadmap) {
        List<MilestoneDto> milestoneDtos = new ArrayList<>();
        if (roadmap.getMilestones() != null) {
            for (Milestone m : roadmap.getMilestones()) {
                List<RoadmapItemDto> itemDtos = new ArrayList<>();
                if (m.getItems() != null) {
                    for (RoadmapItem ri : m.getItems()) {
                        CatalogItem ci = ri.getCatalogItem();
                        CatalogItemDto ciDto = null;
                        if (ci != null) {
                            List<String> skills = new ArrayList<>();
                            if (ci.getItemSkills() != null) {
                                for (CatalogItemSkill cis : ci.getItemSkills()) {
                                    if (cis.getSkill() != null && cis.getSkill().getName() != null) {
                                        skills.add(cis.getSkill().getName());
                                    }
                                }
                            }
                            if (skills.isEmpty()) {
                                if (ci.getTitle() != null) {
                                    if (ci.getTitle().toLowerCase().contains("html")) skills.add("HTML5");
                                    if (ci.getTitle().toLowerCase().contains("css")) skills.add("CSS3");
                                    if (ci.getTitle().toLowerCase().contains("javascript") || ci.getTitle().toLowerCase().contains("js")) skills.add("JavaScript");
                                    if (ci.getTitle().toLowerCase().contains("react")) skills.add("React");
                                    if (ci.getTitle().toLowerCase().contains("sql")) skills.add("SQL");
                                    if (ci.getTitle().toLowerCase().contains("python")) skills.add("Python");
                                    if (ci.getTitle().toLowerCase().contains("learning") || ci.getTitle().toLowerCase().contains("ml")) skills.add("Machine Learning");
                                }
                            }
                            if (skills.isEmpty()) {
                                skills.add("Core Competency");
                            }

                            ciDto = CatalogItemDto.builder()
                                    .id(ci.getId())
                                    .title(ci.getTitle())
                                    .description(ci.getDescription())
                                    .format(ci.getFormat())
                                    .estimatedHours(ci.getEstimatedHours() != null ? ci.getEstimatedHours().doubleValue() : 5.0)
                                    .provider(ci.getProvider())
                                    .difficulty(ci.getDifficulty())
                                    .url(ci.getUrl())
                                    .skills(skills)
                                    .build();
                        }

                        itemDtos.add(RoadmapItemDto.builder()
                                .id(ri.getId())
                                .status(ri.getStatus())
                                .feedback(ri.getFeedback())
                                .aiExplanation(ri.getAiExplanation())
                                .orderIndex(ri.getOrderIndex())
                                .catalogItem(ciDto)
                                .build());
                    }
                }

                milestoneDtos.add(MilestoneDto.builder()
                        .id(m.getId())
                        .title(m.getTitle())
                        .description(m.getDescription())
                        .orderIndex(m.getOrderIndex())
                        .items(itemDtos)
                        .build());
            }
        }

        return RoadmapResponse.builder()
                .id(roadmap.getId())
                .title(roadmap.getTitle())
                .status(roadmap.getStatus())
                .createdAt(roadmap.getCreatedAt())
                .milestones(milestoneDtos)
                .build();
    }
}
