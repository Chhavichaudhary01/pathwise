package com.pathwise.controller;

import com.pathwise.ai.AiProvider;
import com.pathwise.domain.*;
import com.pathwise.dto.ChatMessageDto;
import com.pathwise.dto.ChatRequest;
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
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final LearnerProfileRepository profileRepository;
    private final RoadmapRepository roadmapRepository;
    private final AiProvider aiProvider;
    private final com.pathwise.service.StreakService streakService;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<ChatMessageDto>> getChatHistory() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<ChatMessage> messages = chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userDetails.getId());
        List<ChatMessageDto> dtos = messages.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ChatMessageDto> sendMessage(@RequestBody ChatRequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();

        // Record daily activity streak
        try {
            streakService.recordActivity(user.getId());
        } catch (Exception e) {
            log.debug("Streak update skipped in chat: {}", e.getMessage());
        }

        // 1. Save User Message
        ChatMessage userMsg = new ChatMessage();
        userMsg.setUser(user);
        userMsg.setRole("user");
        userMsg.setContent(request.getMessage());
        chatMessageRepository.save(userMsg);

        // 2. Comprehensive RAG Context Assembly
        Optional<LearnerProfile> profileOpt = profileRepository.findByUserId(user.getId());
        List<Roadmap> roadmaps = roadmapRepository.findByUserId(user.getId());
        List<ChatMessage> history = chatMessageRepository.findByUserIdOrderByCreatedAtAsc(user.getId());

        boolean isGrounded = Boolean.TRUE.equals(request.getIsSearchGrounded());

        StringBuilder ragContext = new StringBuilder();
        ragContext.append("### SYSTEM PERSONA & INSTRUCTIONS\n");
        ragContext.append("You are PathWise AI, an ultra-intelligent, Perplexity-style AI Career & Technical Research Engine.\n");
        ragContext.append("- Provide deep, authoritative, comprehensive, and up-to-date engineering insights.\n");
        ragContext.append("- Include clean, formatted code blocks with language identifiers where appropriate.\n");
        ragContext.append("- CRITICAL FOR VIDEO & COURSE RECOMMENDATIONS: When suggesting video materials or playlists, NEVER invent or hallucinate random video IDs that might be broken or 404. Instead, ALWAYS format video links as canonical YouTube Search URLs (e.g. `https://www.youtube.com/results?search_query=topic+tutorial+freecodecamp`) or official verified channels (e.g. `https://www.youtube.com/@freecodecamp`, `https://www.youtube.com/@Fireship`, `https://www.youtube.com/@TraversyMedia`, `https://www.youtube.com/@TheNetNinja`). This guarantees every link is 100% active and working.\n");
        
        if (isGrounded) {
            ragContext.append("- ACT AS A REAL-TIME GROUNDED SEARCH ENGINE: Synthesize web documentation, official RFCs, and best-practice developer guides.\n");
            ragContext.append("- Use inline numbered citation brackets like [1], [2], [3] throughout your explanation whenever referencing technical specifications, tools, or concepts.\n");
            ragContext.append("- At the very end of your response, MUST include a structured section titled `### SOURCES` with 3-4 authoritative source items in format: `[N] Title | https://url | Brief 1-sentence synopsis`.\n");
            ragContext.append("- Also append a section titled `### RELATED_QUESTIONS` with exactly 3 relevant, insightful follow-up questions for the learner to explore next.\n");
        } else {
            ragContext.append("- Answer directly, concisely, and helpfully with practical advice.\n");
            ragContext.append("- At the very end, append a section titled `### RELATED_QUESTIONS` with 3 relevant follow-up questions.\n");
        }

        ragContext.append("\n### RETRIEVED USER PROFILE (RAG KNOWLEDGE)\n");
        if (profileOpt.isPresent()) {
            LearnerProfile profile = profileOpt.get();
            ragContext.append("Learner Target Goal: ").append(profile.getGoal() != null ? profile.getGoal() : "Full Stack Web Developer").append("\n");
            ragContext.append("Current Skills: ").append(profile.getCurrentSkills() != null ? profile.getCurrentSkills() : "[]").append("\n");
            ragContext.append("Learning Style: ").append(profile.getLearningStyle() != null ? profile.getLearningStyle() : "hands-on").append("\n");
            ragContext.append("Weekly Time Availability: ").append(profile.getWeeklyHours() != null ? profile.getWeeklyHours() : 10).append(" hours/week\n");
        } else {
            ragContext.append("Learner Target Goal: Full Stack Web Developer\n");
            ragContext.append("Learning Style: hands-on\n");
        }

        // Active roadmap and item details
        if (!roadmaps.isEmpty()) {
            Roadmap activeRoadmap = roadmaps.get(0);
            ragContext.append("\n### ACTIVE LEARNING ROADMAP\n");
            ragContext.append("Active Roadmap: ").append(activeRoadmap.getTitle()).append(" (Status: ").append(activeRoadmap.getStatus()).append(")\n");
        }

        // Multi-turn dialogue history
        if (history.size() > 1) {
            ragContext.append("\n### RECENT CONVERSATION MEMORY\n");
            int startIdx = Math.max(0, history.size() - 8);
            for (int i = startIdx; i < history.size() - 1; i++) {
                ChatMessage m = history.get(i);
                String roleLabel = "user".equalsIgnoreCase(m.getRole()) ? "Learner" : "PathWise AI";
                ragContext.append(roleLabel).append(": ").append(m.getContent()).append("\n");
            }
        }

        ragContext.append("\n### USER INQUIRY\n");
        ragContext.append("User asks: ").append(request.getMessage()).append("\n\n");
        ragContext.append("Provide a comprehensive, high-quality response.");

        // 3. Generate Grounded AI Response
        String rawResponse;
        try {
            rawResponse = aiProvider.generateText(ragContext.toString());
            if (rawResponse == null || rawResponse.isBlank()) {
                rawResponse = "I have analyzed your inquiry in relation to your learning path. What specific aspect or code implementation would you like to dive deeper into?";
            }
        } catch (Exception e) {
            rawResponse = "Based on best industry practices, consistent daily execution and building production-grade projects is the most effective approach to mastering this concept.";
        }

        // 4. Parse Perplexity Sources & Follow-Up Questions
        List<ChatMessageDto.SourceCitation> sources = new ArrayList<>();
        List<String> followUps = new ArrayList<>();
        String cleanContent = rawResponse;

        if (cleanContent.contains("### SOURCES")) {
            int sourcesIdx = cleanContent.indexOf("### SOURCES");
            int nextSectionIdx = cleanContent.indexOf("### RELATED_QUESTIONS", sourcesIdx);
            String sourcesBlock = nextSectionIdx != -1 
                    ? cleanContent.substring(sourcesIdx, nextSectionIdx) 
                    : cleanContent.substring(sourcesIdx);

            String[] lines = sourcesBlock.split("\\n");
            for (String line : lines) {
                line = line.trim();
                if (line.startsWith("[") && line.contains("|")) {
                    String[] parts = line.split("\\|");
                    String idx = "1";
                    String title = parts[0].trim();
                    if (title.startsWith("[")) {
                        int close = title.indexOf("]");
                        if (close != -1) {
                            idx = title.substring(1, close);
                            title = title.substring(close + 1).trim();
                        }
                    }
                    String url = parts.length > 1 ? parts[1].trim() : "https://developer.mozilla.org";
                    String snippet = parts.length > 2 ? parts[2].trim() : "Authoritative technical reference";
                    String domain = extractDomain(url);

                    sources.add(ChatMessageDto.SourceCitation.builder()
                            .index(idx)
                            .title(title)
                            .url(url)
                            .snippet(snippet)
                            .domain(domain)
                            .build());
                }
            }
        }

        if (cleanContent.contains("### RELATED_QUESTIONS")) {
            int relIdx = cleanContent.indexOf("### RELATED_QUESTIONS");
            String relBlock = cleanContent.substring(relIdx);
            String[] lines = relBlock.split("\\n");
            for (String line : lines) {
                String trimmed = line.trim().replaceAll("^[0-9]+[.)-]\\s*", "").replaceAll("^[*-]\\s*", "");
                if (!trimmed.isBlank() && !trimmed.startsWith("###") && trimmed.endsWith("?")) {
                    followUps.add(trimmed);
                }
            }
        }

        // Clean out structured metadata from the main message body for sleek UI
        if (cleanContent.contains("### SOURCES")) {
            cleanContent = cleanContent.substring(0, cleanContent.indexOf("### SOURCES")).trim();
        } else if (cleanContent.contains("### RELATED_QUESTIONS")) {
            cleanContent = cleanContent.substring(0, cleanContent.indexOf("### RELATED_QUESTIONS")).trim();
        }

        // Default authoritative citations if search grounded is active and none parsed
        if (isGrounded && sources.isEmpty()) {
            sources.add(ChatMessageDto.SourceCitation.builder()
                    .index("1")
                    .title("MDN Web Developer Documentation")
                    .url("https://developer.mozilla.org")
                    .snippet("Industry standard web platform specifications and APIs")
                    .domain("developer.mozilla.org")
                    .build());
            sources.add(ChatMessageDto.SourceCitation.builder()
                    .index("2")
                    .title("Roadmap.sh Engineering Guides")
                    .url("https://roadmap.sh")
                    .snippet("Curated career milestone tracks and prerequisite trees")
                    .domain("roadmap.sh")
                    .build());
            sources.add(ChatMessageDto.SourceCitation.builder()
                    .index("3")
                    .title("GitHub Official Docs & RFCs")
                    .url("https://github.com")
                    .snippet("Production architectures and community implementations")
                    .domain("github.com")
                    .build());
        }

        // 5. Save AI Response
        ChatMessage aiMsg = new ChatMessage();
        aiMsg.setUser(user);
        aiMsg.setRole("assistant");
        aiMsg.setContent(cleanContent);
        ChatMessage savedAiMsg = chatMessageRepository.save(aiMsg);

        ChatMessageDto dto = toDto(savedAiMsg);
        dto.setIsSearchGrounded(isGrounded);
        dto.setSources(sources);
        dto.setFollowUpQuestions(followUps.isEmpty() ? List.of(
                "Can you show a complete code example?",
                "What are the most common pitfalls with this approach?",
                "How does this connect to my active roadmap milestone?"
        ) : followUps.stream().limit(3).collect(Collectors.toList()));

        return ResponseEntity.ok(dto);
    }

    private String extractDomain(String url) {
        try {
            if (!url.startsWith("http")) url = "https://" + url;
            java.net.URI uri = new java.net.URI(url);
            String host = uri.getHost();
            return host != null ? host.replaceFirst("^www\\.", "") : "docs.dev";
        } catch (Exception e) {
            return "docs.dev";
        }
    }

    @DeleteMapping
    @Transactional
    public ResponseEntity<?> clearChatHistory() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        chatMessageRepository.deleteByUserId(userDetails.getId());
        return ResponseEntity.ok(Map.of("message", "Chat history cleared successfully."));
    }

    private ChatMessageDto toDto(ChatMessage message) {
        return ChatMessageDto.builder()
                .id(message.getId())
                .role(message.getRole())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
