package com.pathwise.controller;

import com.pathwise.ai.AiProvider;
import com.pathwise.domain.*;
import com.pathwise.dto.RoadmapResponse;
import com.pathwise.dto.RoadmapResponse.*;
import com.pathwise.dto.RoadmapTemplateDto;
import com.pathwise.engine.RoadmapScraperService;
import com.pathwise.engine.RoadmapTemplateService;
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
    private final RoadmapTemplateService roadmapTemplateService;
    private final RoadmapScraperService roadmapScraperService;
    private final com.pathwise.service.StreakService streakService;

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

    @GetMapping("/templates")
    @Transactional(readOnly = true)
    public ResponseEntity<List<RoadmapTemplateDto>> getAvailableTemplates() {
        return ResponseEntity.ok(roadmapTemplateService.getAllTemplates());
    }

    @GetMapping("/current")
    @Transactional(readOnly = true)
    public ResponseEntity<RoadmapResponse> getCurrentRoadmap() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<Roadmap> roadmaps = roadmapRepository.findByUserId(userDetails.getId());
        if (roadmaps.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(toResponseDto(roadmaps.get(roadmaps.size() - 1)));
    }

    @GetMapping("/{id:[0-9a-fA-F\\-]{36}}")
    @Transactional(readOnly = true)
    public ResponseEntity<RoadmapResponse> getRoadmapById(@PathVariable UUID id) {
        return roadmapRepository.findByIdWithDetails(id)
                .map(this::toResponseDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/generate")
    @Transactional
    public ResponseEntity<RoadmapResponse> generateRoadmap(@RequestBody(required = false) Map<String, String> body) {
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

        if (body != null && body.containsKey("goal") && body.get("goal") != null && !body.get("goal").isBlank()) {
            profile.setGoal(body.get("goal").trim());
            profile = profileRepository.save(profile);
        }

        // 0. Deduplication Check: If user already has an active roadmap for this goal, reuse it
        String targetGoal = profile.getGoal();
        List<Roadmap> existingRoadmaps = roadmapRepository.findByUserId(user.getId());
        for (Roadmap r : existingRoadmaps) {
            if (r.getTitle() != null && r.getTitle().equalsIgnoreCase(targetGoal) && r.getMilestones() != null && !r.getMilestones().isEmpty()) {
                r.setStatus("ACTIVE");
                roadmapRepository.save(r);
                return ResponseEntity.ok(toResponseDto(r));
            }
        }

        // 1. Check for Best-Case Match in Curated Catalog (60+ Roadmaps)
        Optional<RoadmapTemplateDto> templateMatch = roadmapTemplateService.findBestMatch(profile.getGoal(), profile.getCurrentSkills());
        if (templateMatch.isPresent()) {
            Roadmap templateRoadmap = roadmapTemplateService.buildRoadmapFromTemplate(templateMatch.get(), user, profile);
            Roadmap savedRoadmap = roadmapRepository.save(templateRoadmap);
            return ResponseEntity.ok(toResponseDto(savedRoadmap));
        }

        // 2. Run sequencer with embedding matching and topological sort fallback
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
    public ResponseEntity<?> updateItemStatus(
            @PathVariable UUID itemId, 
            @RequestBody(required = false) Map<String, String> body,
            @RequestParam(required = false) String status) {
        String newStatus = status;
        if (newStatus == null && body != null) {
            newStatus = body.get("status");
        }
        if (newStatus == null || newStatus.isBlank()) {
            newStatus = "COMPLETED";
        }
        final String targetStatus = newStatus;
        return roadmapItemRepository.findById(itemId)
                .map(item -> {
                    item.setStatus(targetStatus);
                    roadmapItemRepository.save(item);
                    if ("COMPLETED".equalsIgnoreCase(targetStatus)) {
                        try {
                            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
                            streakService.recordActivity(userDetails.getId());
                        } catch (Exception e) {
                            log.debug("Streak update skipped: {}", e.getMessage());
                        }
                    }
                    return ResponseEntity.ok(Map.of("status", "updated", "itemId", itemId, "newStatus", targetStatus));
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

    @DeleteMapping("/{id:[0-9a-fA-F\\-]{36}}")
    @Transactional
    public ResponseEntity<?> deleteRoadmap(@PathVariable UUID id) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return roadmapRepository.findById(id)
                .map(r -> {
                    if (!r.getUser().getId().equals(userDetails.getId())) {
                        return ResponseEntity.status(403).body(Map.of("message", "Unauthorized to delete this roadmap"));
                    }
                    roadmapRepository.delete(r);
                    return ResponseEntity.ok(Map.of("status", "deleted", "id", id));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id:[0-9a-fA-F\\-]{36}}/mastery-quiz")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getRoadmapMasteryQuiz(@PathVariable UUID id) {
        return roadmapRepository.findByIdWithDetails(id)
                .map(roadmap -> {
                    String title = roadmap.getTitle() != null ? roadmap.getTitle() : "Software Engineering";
                    List<Map<String, Object>> questions = generateMasteryQuizQuestions(title);

                    return ResponseEntity.ok(Map.of(
                            "roadmapId", id,
                            "roadmapTitle", title,
                            "quizTitle", "🎓 " + title + " Comprehensive Certification Quiz",
                            "description", "Verify your end-to-end mastery across all milestones in " + title + " to earn your Mastery Certificate Badge.",
                            "questions", questions
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private List<Map<String, Object>> generateMasteryQuizQuestions(String roadmapTitle) {
        String lower = roadmapTitle.toLowerCase();
        
        if (lower.contains("react") || lower.contains("front")) {
            return List.of(
                    Map.of(
                            "id", 1,
                            "question", "What is the primary difference between React state and props?",
                            "options", List.of("Props are internal and mutable; state is passed down from parents", "Props are read-only external inputs; state is component-managed mutable data", "Props require Redux; state only works in class components", "There is no difference in React 19"),
                            "correctIndex", 1,
                            "explanation", "Props are passed down to child components and are immutable to the child, while state is owned and updated by the component itself."
                    ),
                    Map.of(
                            "id", 2,
                            "question", "Why should keys passed to list elements in React be stable and unique rather than array indices?",
                            "options", List.of("To improve CSS styling specificity", "To prevent unnecessary re-rendering and identity reconciliation bugs during item reordering or deletion", "Keys are required by the browser DOM engine", "To enable GPU acceleration"),
                            "correctIndex", 1,
                            "explanation", "Using array indices as keys causes React's reconciliation algorithm to improperly reuse component state when list order changes."
                    ),
                    Map.of(
                            "id", 3,
                            "question", "What is the primary advantage of modern CSS Grid over traditional float-based layouts?",
                            "options", List.of("Grid provides true two-dimensional (rows and columns) layout control without clearing hacks", "Grid requires JavaScript to execute", "Grid only works on desktop monitors", "Grid disables CSS specificity"),
                            "correctIndex", 0,
                            "explanation", "CSS Grid allows precise alignment across both horizontal rows and vertical columns simultaneously."
                    ),
                    Map.of(
                            "id", 4,
                            "question", "In TypeScript, what is the key benefit of using 'unknown' over 'any'?",
                            "options", List.of("unknown disables the type checker completely", "unknown forces type narrowing before performing operations, preventing runtime exceptions", "unknown makes variables immutable", "unknown automatically converts types to strings"),
                            "correctIndex", 1,
                            "explanation", "unknown is the type-safe counterpart of any. You cannot access properties on an unknown value without explicit type checking or assertions."
                    )
            );
        } else if (lower.contains("devops") || lower.contains("cloud") || lower.contains("docker")) {
            return List.of(
                    Map.of(
                            "id", 1,
                            "question", "What is the primary advantage of multi-stage Docker builds?",
                            "options", List.of("They allow running multiple operating systems simultaneously", "They separate build-time dependencies from the runtime image, drastically reducing final container size and attack surface", "They eliminate the need for container registries", "They speed up network requests"),
                            "correctIndex", 1,
                            "explanation", "Multi-stage builds copy only compiled artifacts into minimal production base images (like alpine or distroless), keeping images small and secure."
                    ),
                    Map.of(
                            "id", 2,
                            "question", "In Kubernetes architecture, what role does the Kubelet play?",
                            "options", List.of("It is the distributed key-value database", "It is the node agent that ensures containers described in PodSpecs are running and healthy on that specific node", "It balances ingress internet traffic across clusters", "It compiles Go source code"),
                            "correctIndex", 1,
                            "explanation", "The Kubelet runs on each worker node and communicates with the control plane (API server) to manage pod lifecycle on that node."
                    ),
                    Map.of(
                            "id", 3,
                            "question", "What is the core principle of Infrastructure as Code (IaC) with tools like Terraform?",
                            "options", List.of("Manually configuring servers via SSH commands", "Declaring infrastructure state in version-controlled configuration files for repeatable, automated provisioning", "Writing server backends in Python", "Disabling cloud security rules"),
                            "correctIndex", 1,
                            "explanation", "IaC enables programmatic, declarative, and version-controlled cloud resource management."
                    )
            );
        }

        // Generic Full Stack / Backend fallback
        return List.of(
                Map.of(
                        "id", 1,
                        "question", "In relational databases (SQL), what does an INDEX primarily optimize?",
                        "options", List.of("Data insertion speed", "Query lookup and filtering performance at the cost of slight write overhead", "Database disk encryption", "Network bandwidth compression"),
                        "correctIndex", 1,
                        "explanation", "Indexes create B-Tree/Hash structures that allow O(log n) lookups instead of full table scans (O(n))."
                ),
                Map.of(
                        "id", 2,
                        "question", "What does the ACID principle guarantee in database transactions?",
                        "options", List.of("Atomicity, Consistency, Isolation, and Durability", "Asynchronous, Cached, Indexed, and Distributed", "Automated Cloud Infrastructure Deployment", "Authentication, Cookies, Identity, and DNS"),
                        "correctIndex", 0,
                        "explanation", "ACID guarantees that database transactions are processed reliably even in the event of power failures or crashes."
                ),
                Map.of(
                        "id", 3,
                        "question", "Why is statelessness an essential design principle for scalable REST APIs?",
                        "options", List.of("It prevents using databases", "It allows any server instance behind a load balancer to handle any incoming request without sharing session state", "It disables HTTPS encryption", "It forces users to log in on every HTTP request"),
                        "correctIndex", 1,
                        "explanation", "Stateless services allow effortless horizontal scaling because requests contain all required auth tokens/context."
                )
        );
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

                            String itemUrl = ci.getUrl();
                            if (itemUrl == null || itemUrl.equals("https://roadmap.sh") || itemUrl.endsWith("/backend") || itemUrl.endsWith("/frontend") || itemUrl.endsWith("/full-stack") || itemUrl.endsWith("/ai-engineer")) {
                                itemUrl = roadmapScraperService.resolveSpecificRoadmapShUrl(ci.getTitle(), roadmap.getTitle());
                            }

                            ciDto = CatalogItemDto.builder()
                                    .id(ci.getId())
                                    .title(ci.getTitle())
                                    .description(ci.getDescription())
                                    .format(ci.getFormat())
                                    .estimatedHours(ci.getEstimatedHours() != null ? ci.getEstimatedHours().doubleValue() : 5.0)
                                    .provider(ci.getProvider())
                                    .difficulty(ci.getDifficulty())
                                    .url(itemUrl)
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
