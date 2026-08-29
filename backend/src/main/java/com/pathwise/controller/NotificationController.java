package com.pathwise.controller;

import com.pathwise.domain.LearnerProfile;
import com.pathwise.domain.User;
import com.pathwise.domain.UserNotification;
import com.pathwise.dto.UserNotificationDto;
import com.pathwise.repository.LearnerProfileRepository;
import com.pathwise.repository.UserNotificationRepository;
import com.pathwise.repository.UserRepository;
import com.pathwise.security.UserDetailsImpl;
import com.pathwise.service.DailyReminderService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final LearnerProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final UserNotificationRepository notificationRepository;
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
    @Transactional
    public ResponseEntity<NotificationPreferencesDto> updatePreferences(@RequestBody NotificationPreferencesDto req) {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        LearnerProfile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    LearnerProfile p = new LearnerProfile();
                    p.setUser(user);
                    return p;
                });

        if (req.getDailyReminderEnabled() != null) profile.setDailyReminderEnabled(req.getDailyReminderEnabled());
        if (req.getDailyReminderTime() != null) profile.setDailyReminderTime(req.getDailyReminderTime());
        if (req.getNotificationEmail() != null) profile.setNotificationEmail(req.getNotificationEmail().trim());

        profileRepository.save(profile);

        req.setStreakCount(profile.getStreakCount() != null ? profile.getStreakCount() : 1);
        req.setLongestStreak(profile.getLongestStreak() != null ? profile.getLongestStreak() : 1);

        return ResponseEntity.ok(req);
    }

    @PostMapping("/send-test-reminder")
    @Transactional
    public ResponseEntity<?> sendTestReminder() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        boolean sent = dailyReminderService.sendReminderForUserId(userDetails.getId());
        if (sent) {
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Test reminder dispatched successfully! Check your email and notification center."
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Could not dispatch reminder. Please verify your notification preferences."
            ));
        }
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<UserNotificationDto>> getUserNotifications() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<UserNotification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userDetails.getId());
        
        // If user has no notifications yet, initialize with welcome & streak notifications
        if (notifications.isEmpty()) {
            User user = userRepository.findById(userDetails.getId()).orElse(null);
            if (user != null) {
                UserNotification welcome = UserNotification.builder()
                        .user(user)
                        .title("🌟 Welcome to PathWise!")
                        .message("Your AI Career Coach and Topological Roadmap are ready. Start exploring your personalized track.")
                        .type("SYSTEM")
                        .link("/roadmap")
                        .isRead(false)
                        .build();
                notificationRepository.save(welcome);
                notifications = List.of(welcome);
            }
        }

        List<UserNotificationDto> dtos = notifications.stream().map(n -> UserNotificationDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .link(n.getLink())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build()).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{id}/read")
    @Transactional
    public ResponseEntity<?> markAsRead(@PathVariable UUID id) {
        return notificationRepository.findById(id).map(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
            return ResponseEntity.ok(Map.of("status", "success", "id", id));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/read-all")
    @Transactional
    public ResponseEntity<?> markAllAsRead() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        notificationRepository.markAllAsReadForUser(userDetails.getId());
        return ResponseEntity.ok(Map.of("status", "success", "message", "All notifications marked as read"));
    }
}
