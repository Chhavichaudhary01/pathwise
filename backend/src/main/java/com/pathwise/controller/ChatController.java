package com.pathwise.controller;

import com.pathwise.ai.AiProvider;
import com.pathwise.domain.ChatMessage;
import com.pathwise.domain.LearnerProfile;
import com.pathwise.domain.Roadmap;
import com.pathwise.domain.User;
import com.pathwise.dto.ChatRequest;
import com.pathwise.repository.ChatMessageRepository;
import com.pathwise.repository.LearnerProfileRepository;
import com.pathwise.repository.RoadmapRepository;
import com.pathwise.repository.UserRepository;
import com.pathwise.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

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
    public ResponseEntity<List<ChatMessage>> getChatHistory() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userDetails.getId()));
    }

    @PostMapping
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody ChatRequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();

        ChatMessage userMsg = new ChatMessage();
        userMsg.setUser(user);
        userMsg.setRole("user");
        userMsg.setContent(request.getMessage());
        chatMessageRepository.save(userMsg);

        // Ground prompt in user profile and active roadmap
        Optional<LearnerProfile> profileOpt = profileRepository.findByUserId(user.getId());
        List<Roadmap> roadmaps = roadmapRepository.findByUserId(user.getId());

        StringBuilder contextBuilder = new StringBuilder();
        contextBuilder.append("You are PathWise AI Career Coach, an intelligent mentor helping the learner achieve their career milestones.\n");
        if (profileOpt.isPresent()) {
            contextBuilder.append("Learner Target Goal: ").append(profileOpt.get().getGoal()).append("\n");
            contextBuilder.append("Current Skills: ").append(profileOpt.get().getCurrentSkills()).append("\n");
            contextBuilder.append("Learning Style: ").append(profileOpt.get().getLearningStyle()).append("\n");
        }
        if (!roadmaps.isEmpty()) {
            contextBuilder.append("Active Roadmap: ").append(roadmaps.get(0).getTitle()).append("\n");
        }
        contextBuilder.append("\nUser asks: ").append(request.getMessage());
        contextBuilder.append("\nProvide an actionable, structured, encouraging response with specific tips and milestone advice.");

        String aiResponse = aiProvider.generateText(contextBuilder.toString());

        ChatMessage aiMsg = new ChatMessage();
        aiMsg.setUser(user);
        aiMsg.setRole("assistant");
        aiMsg.setContent(aiResponse);
        chatMessageRepository.save(aiMsg);

        return ResponseEntity.ok(aiMsg);
    }
}
