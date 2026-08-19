package com.pathwise.controller;

import com.pathwise.domain.LearnerProfile;
import com.pathwise.domain.User;
import com.pathwise.repository.LearnerProfileRepository;
import com.pathwise.repository.UserRepository;
import com.pathwise.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final LearnerProfileRepository profileRepository;
    private final UserRepository userRepository;

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
        profile.setWeeklyHours(newProfile.getWeeklyHours());
        profile.setLearningStyle(newProfile.getLearningStyle());
        
        return ResponseEntity.ok(profileRepository.save(profile));
    }
}
