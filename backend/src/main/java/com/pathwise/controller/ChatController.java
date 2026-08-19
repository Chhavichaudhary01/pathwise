package com.pathwise.controller;

import com.pathwise.ai.AiProvider;
import com.pathwise.domain.ChatMessage;
import com.pathwise.domain.User;
import com.pathwise.dto.ChatRequest;
import com.pathwise.repository.ChatMessageRepository;
import com.pathwise.repository.UserRepository;
import com.pathwise.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
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

        // Get AI Response
        String aiResponse = aiProvider.generateText(request.getMessage());

        ChatMessage aiMsg = new ChatMessage();
        aiMsg.setUser(user);
        aiMsg.setRole("assistant");
        aiMsg.setContent(aiResponse);
        chatMessageRepository.save(aiMsg);

        return ResponseEntity.ok(aiMsg);
    }
}
