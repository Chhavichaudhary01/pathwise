package com.pathwise.controller;

import com.pathwise.domain.LearnerProfile;
import com.pathwise.domain.User;
import com.pathwise.repository.LearnerProfileRepository;
import com.pathwise.repository.UserRepository;
import com.pathwise.security.UserDetailsImpl;
import com.pathwise.service.DailyReminderService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final LearnerProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final DailyReminderService dailyReminderService;

    @Data
    public static class NotificationPreferencesDto {
        private Boolean dailyReminderEnabled;
        private String dailyReminderTime;
        private String notificationEmail;
        private Integer streakCount;
        private Integer longestStreak;
    }

    @GetMapping("/preferences")
    public ResponseEntity<NotificationPreferencesDto> getPreferences() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        LearnerProfile profile = profileRepository.findByUserId(user.getId()).orElse(new LearnerProfile());

        NotificationPreferencesDto dto = new NotificationPreferencesDto();
        dto.setDailyReminderEnabled(profile.getDailyReminderEnabled() != null ? profile.getDailyReminderEnabled() : true);
        dto.setDailyReminderTime(profile.getDailyReminderTime() != null ? profile.getDailyReminderTime() : "09:00");
        dto.setNotificationEmail(profile.getNotificationEmail() != null ? profile.getNotificationEmail() : user.getEmail());
        dto.setStreakCount(profile.getStreakCount() != null ? profile.getStreakCount() : 1);
        dto.setLongestStreak(profile.getLongestStreak() != null ? profile.getLongestStreak() : 1);

        return ResponseEntity.ok(dto);
    }

    @PutMapping("/preferences")
    public ResponseEntity<NotificationPreferencesDto> updatePreferences(@RequestBody NotificationPreferencesDto req) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        LearnerProfile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    LearnerProfile p = new LearnerProfile();
                    p.setUser(user);
                    return profileRepository.save(p);
                });

        if (req.getDailyReminderEnabled() != null) {
            profile.setDailyReminderEnabled(req.getDailyReminderEnabled());
        }
        if (req.getDailyReminderTime() != null && !req.getDailyReminderTime().isBlank()) {
            profile.setDailyReminderTime(req.getDailyReminderTime());
        }
        if (req.getNotificationEmail() != null) {
            profile.setNotificationEmail(req.getNotificationEmail().trim());
        }

        LearnerProfile saved = profileRepository.save(profile);

        NotificationPreferencesDto dto = new NotificationPreferencesDto();
        dto.setDailyReminderEnabled(saved.getDailyReminderEnabled());
        dto.setDailyReminderTime(saved.getDailyReminderTime());
        dto.setNotificationEmail(saved.getNotificationEmail());
        dto.setStreakCount(saved.getStreakCount());
        dto.setLongestStreak(saved.getLongestStreak());

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/test-reminder")
    public ResponseEntity<Map<String, Object>> sendTestReminder() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        boolean sent = dailyReminderService.sendReminderForUserId(userDetails.getId());

        if (sent) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Test reminder email dispatched successfully! Check your inbox or terminal log."
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Unable to send reminder email. Please check your notification email address."
            ));
        }
    }
}
