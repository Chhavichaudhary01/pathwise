package com.pathwise.controller;

import com.pathwise.domain.LearnerProfile;
import com.pathwise.domain.Roadmap;
import com.pathwise.domain.User;
import com.pathwise.repository.ChatMessageRepository;
import com.pathwise.repository.LearnerProfileRepository;
import com.pathwise.repository.RoadmapRepository;
import com.pathwise.repository.UserRepository;
import com.pathwise.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final LearnerProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final RoadmapRepository roadmapRepository;
    private final ChatMessageRepository chatMessageRepository;

    @GetMapping
    public ResponseEntity<LearnerProfile> getProfile() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return profileRepository.findByUserId(userDetails.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<LearnerProfile> createOrUpdateProfile(@RequestBody LearnerProfile newProfile) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        LearnerProfile profile = profileRepository.findByUserId(userDetails.getId()).orElse(new LearnerProfile());
        profile.setUser(user);
        profile.setGoal(newProfile.getGoal());
        profile.setCurrentSkills(newProfile.getCurrentSkills());
        profile.setInterests(newProfile.getInterests());
        profile.setLearningHistory(newProfile.getLearningHistory());
        profile.setWeeklyHours(newProfile.getWeeklyHours() != null ? newProfile.getWeeklyHours() : 10);
        profile.setLearningStyle(newProfile.getLearningStyle() != null ? newProfile.getLearningStyle() : "hands-on");
        
        return ResponseEntity.ok(profileRepository.save(profile));
    }

    @GetMapping("/export")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> exportUserData() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        LearnerProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        List<Roadmap> roadmaps = roadmapRepository.findByUserId(user.getId());

        Map<String, Object> export = new HashMap<>();
        export.put("userEmail", user.getEmail());
        export.put("exportedAt", java.time.OffsetDateTime.now().toString());
        export.put("profile", profile);
        export.put("roadmapsCount", roadmaps.size());
        export.put("roadmaps", roadmaps);

        return ResponseEntity.ok(export);
    }

    @DeleteMapping("/account")
    @Transactional
    public ResponseEntity<?> deleteAccount() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        log.info("Deleting account for user: {}", userDetails.getId());
        userRepository.deleteById(userDetails.getId());
        return ResponseEntity.ok(Map.of("message", "Account and all associated learning data deleted successfully."));
    }
}
