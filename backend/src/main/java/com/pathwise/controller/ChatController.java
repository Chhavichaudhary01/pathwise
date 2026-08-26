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

        StringBuilder ragContext = new StringBuilder();
        ragContext.append("### SYSTEM PERSONA & INSTRUCTIONS\n");
        ragContext.append("You are PathWise AI Career Coach, a smart, friendly, and adaptive technical mentor.\n");
        ragContext.append("- Answer the user's inquiry directly, accurately, and in a natural, engaging conversational tone.\n");
        ragContext.append("- For general or casual questions, answer concisely and directly without forcing unrelated roadmap templates.\n");
        ragContext.append("- For technical, coding, or career roadmap questions, provide deep, practical insights, clean code examples, and actionable milestone guidance tailored to their profile.\n");
        ragContext.append("- Use clean, readable markdown formatting.\n\n");

        ragContext.append("### RETRIEVED USER PROFILE (RAG KNOWLEDGE)\n");
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

            List<String> completedList = new ArrayList<>();
            String nextPendingItem = null;

            if (activeRoadmap.getMilestones() != null) {
                for (Milestone m : activeRoadmap.getMilestones()) {
                    ragContext.append("- ").append(m.getTitle()).append(" (Order ").append(m.getOrderIndex()).append(")\n");
                    if (m.getItems() != null) {
                        for (RoadmapItem item : m.getItems()) {
                            String itemTitle = item.getCatalogItem() != null ? item.getCatalogItem().getTitle() : "Module";
                            String status = item.getStatus() != null ? item.getStatus() : "TODO";
                            ragContext.append("   * [").append(status).append("] ").append(itemTitle);
                            if (item.getCatalogItem() != null) {
                                ragContext.append(" (").append(item.getCatalogItem().getDifficulty()).append(", ").append(item.getCatalogItem().getFormat()).append(")");
                            }
                            ragContext.append("\n");

                            if ("COMPLETED".equalsIgnoreCase(status)) {
                                completedList.add(itemTitle);
                            } else if (nextPendingItem == null && ("IN_PROGRESS".equalsIgnoreCase(status) || "TODO".equalsIgnoreCase(status))) {
                                nextPendingItem = itemTitle + (item.getCatalogItem() != null ? " (" + item.getCatalogItem().getDescription() + ")" : "");
                            }
                        }
                    }
                }
            }

            if (!completedList.isEmpty()) {
                ragContext.append("Completed Competencies: ").append(String.join(", ", completedList)).append("\n");
            }
            if (nextPendingItem != null) {
                ragContext.append("Next Pending Milestone / Item: ").append(nextPendingItem).append("\n");
            }
        }

        // Add recent conversation history for multi-turn context
        if (history.size() > 1) {
            ragContext.append("\n### RECENT CONVERSATION MEMORY (MULTI-TURN DIALOGUE)\n");
            int startIdx = Math.max(0, history.size() - 12);
            for (int i = startIdx; i < history.size() - 1; i++) {
                ChatMessage m = history.get(i);
                String roleLabel = "user".equalsIgnoreCase(m.getRole()) ? "Learner" : "AI Career Coach";
                ragContext.append(roleLabel).append(": ").append(m.getContent()).append("\n");
            }
        }

        ragContext.append("\n### USER INQUIRY\n");
        ragContext.append("User asks: ").append(request.getMessage()).append("\n\n");
        ragContext.append("Respond naturally, accurately, and helpfully to the user's inquiry.");

        // 3. Generate Grounded AI Response
        String aiResponse = aiProvider.generateText(ragContext.toString());

        // 4. Save AI Response
        ChatMessage aiMsg = new ChatMessage();
        aiMsg.setUser(user);
        aiMsg.setRole("assistant");
        aiMsg.setContent(aiResponse);
        ChatMessage savedAiMsg = chatMessageRepository.save(aiMsg);

        return ResponseEntity.ok(toDto(savedAiMsg));
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
