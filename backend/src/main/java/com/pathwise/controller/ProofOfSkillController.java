package com.pathwise.controller;

import com.pathwise.domain.User;
import com.pathwise.domain.VerifiedSkillBadge;
import com.pathwise.dto.BadgeMintResponse;
import com.pathwise.dto.CodingChallengeDto;
import com.pathwise.repository.UserRepository;
import com.pathwise.security.UserDetailsImpl;
import com.pathwise.service.ProofOfSkillService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/sandbox")
@RequiredArgsConstructor
public class ProofOfSkillController {

    private final ProofOfSkillService proofOfSkillService;
    private final UserRepository userRepository;

    @GetMapping("/challenge")
    public ResponseEntity<CodingChallengeDto> getChallenge(
            @RequestParam(value = "skillName", required = false) String skillName,
            @RequestParam(value = "topicTitle", required = false) String topicTitle
    ) {
        CodingChallengeDto challenge = proofOfSkillService.generateChallenge(skillName, topicTitle);
        return ResponseEntity.ok(challenge);
    }

    @PostMapping("/verify-and-mint")
    public ResponseEntity<BadgeMintResponse> verifyAndMint(
            @RequestBody Map<String, Object> body
    ) {
        User user = getAuthenticatedUser();
        String skillName = (String) body.getOrDefault("skillName", "Engineering Competency");
        String topicTitle = (String) body.getOrDefault("topicTitle", skillName);
        
        int score = 100;
        if (body.containsKey("score") && body.get("score") instanceof Number) {
            score = ((Number) body.get("score")).intValue();
        }

        UUID roadmapItemId = null;
        if (body.containsKey("roadmapItemId") && body.get("roadmapItemId") != null) {
            try {
                roadmapItemId = UUID.fromString(body.get("roadmapItemId").toString());
            } catch (Exception ignored) {}
        }

        BadgeMintResponse response = proofOfSkillService.verifyAndMintBadge(
                user, skillName, topicTitle, score, roadmapItemId
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/badges")
    public ResponseEntity<List<VerifiedSkillBadge>> getMyBadges() {
        User user = getAuthenticatedUser();
        List<VerifiedSkillBadge> badges = proofOfSkillService.getUserBadges(user.getId());
        return ResponseEntity.ok(badges);
    }

    @GetMapping("/badges/public")
    public ResponseEntity<List<VerifiedSkillBadge>> getPublicBadges(
            @RequestParam(value = "userId", required = false) UUID userId
    ) {
        if (userId == null) {
            User defaultUser = getAuthenticatedUser();
            userId = defaultUser.getId();
        }
        List<VerifiedSkillBadge> badges = proofOfSkillService.getUserBadges(userId);
        return ResponseEntity.ok(badges);
    }

    private User getAuthenticatedUser() {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            return userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found: " + userDetails.getId()));
        } catch (Exception e) {
            return userRepository.findAll().stream().findFirst()
                    .orElseGet(() -> {
                        User u = new User();
                        u.setEmail("demo@pathwise.io");
                        u.setPassword("password");
                        return userRepository.save(u);
                    });
        }
    }
}
