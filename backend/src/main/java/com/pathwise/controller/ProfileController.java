package com.pathwise.controller;

import com.pathwise.domain.LearnerProfile;
import com.pathwise.domain.Roadmap;
import com.pathwise.domain.User;
import com.pathwise.repository.ChatMessageRepository;
import com.pathwise.repository.LearnerProfileRepository;
import com.pathwise.repository.RoadmapRepository;
import com.pathwise.repository.UserRepository;
import com.pathwise.security.UserDetailsImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<LearnerProfile> getProfile() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return profileRepository.findByUserId(userDetails.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<LearnerProfile> createOrUpdateProfile(@RequestBody com.pathwise.dto.ProfileRequest newProfile) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        LearnerProfile profile = profileRepository.findByUserId(userDetails.getId()).orElse(new LearnerProfile());
        profile.setUser(user);
        if (newProfile.getGoal() != null && !newProfile.getGoal().isBlank()) {
            profile.setGoal(newProfile.getGoal());
        }
        if (newProfile.getCurrentSkills() != null) {
            profile.setCurrentSkills(newProfile.getCurrentSkillsJson(objectMapper));
        } else if (profile.getCurrentSkills() == null) {
            profile.setCurrentSkills("[]");
        }
        if (newProfile.getInterests() != null) {
            profile.setInterests(newProfile.getInterestsJson(objectMapper));
        } else if (profile.getInterests() == null) {
            profile.setInterests("[]");
        }
        if (newProfile.getLearningHistory() != null) {
            profile.setLearningHistory(newProfile.getLearningHistoryJson(objectMapper));
        } else if (profile.getLearningHistory() == null) {
            profile.setLearningHistory("[]");
        }
        if (newProfile.getWeeklyHours() != null) {
            profile.setWeeklyHours(newProfile.getWeeklyHours());
        } else if (profile.getWeeklyHours() == null) {
            profile.setWeeklyHours(10);
        }
        if (newProfile.getAge() != null) {
            profile.setAge(newProfile.getAge());
        }
        if (newProfile.getClassGrade() != null && !newProfile.getClassGrade().isBlank()) {
            profile.setClassGrade(newProfile.getClassGrade());
        }
        if (newProfile.getBoard() != null && !newProfile.getBoard().isBlank()) {
            profile.setBoard(newProfile.getBoard());
        }
        if (newProfile.getAddress() != null && !newProfile.getAddress().isBlank()) {
            profile.setAddress(newProfile.getAddress());
        }
        if (newProfile.getIsProfileComplete() != null) {
            profile.setIsProfileComplete(newProfile.getIsProfileComplete());
        } else if (profile.getAge() != null && profile.getClassGrade() != null) {
            profile.setIsProfileComplete(true);
        }
        
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
