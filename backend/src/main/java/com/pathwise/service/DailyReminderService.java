package com.pathwise.service;

import com.pathwise.domain.LearnerProfile;
import com.pathwise.domain.Milestone;
import com.pathwise.domain.Roadmap;
import com.pathwise.domain.RoadmapItem;
import com.pathwise.domain.User;
import com.pathwise.repository.LearnerProfileRepository;
import com.pathwise.repository.RoadmapRepository;
import com.pathwise.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DailyReminderService {

    private final LearnerProfileRepository profileRepository;
    private final RoadmapRepository roadmapRepository;
    private final UserRepository userRepository;

    /**
     * Runs every hour at minute 0 to dispatch reminders matching user's selected hour.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional(readOnly = true)
    public void executeHourlyReminderCron() {
        String currentHour = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:00"));
        log.info("Executing PathWise Daily Reminder Cron for hour: {}", currentHour);

        List<LearnerProfile> profiles = profileRepository.findAll();
        for (LearnerProfile profile : profiles) {
            if (Boolean.TRUE.equals(profile.getDailyReminderEnabled())) {
                String reminderTime = profile.getDailyReminderTime();
                if (reminderTime != null && reminderTime.startsWith(currentHour.substring(0, 2))) {
                    try {
                        sendReminderToUser(profile);
                    } catch (Exception e) {
                        log.warn("Failed to dispatch scheduled reminder to user: {}", e.getMessage());
                    }
                }
            }
        }
    }

    /**
     * Send an immediate test or scheduled reminder email.
     */
    @Transactional(readOnly = true)
    public boolean sendReminderForUserId(UUID userId) {
        Optional<LearnerProfile> profileOpt = profileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) return false;
        return sendReminderToUser(profileOpt.get());
    }

    private boolean sendReminderToUser(LearnerProfile profile) {
        User user = profile.getUser();
        if (user == null) return false;

        String recipientEmail = (profile.getNotificationEmail() != null && !profile.getNotificationEmail().isBlank())
                ? profile.getNotificationEmail()
                : user.getEmail();

        if (recipientEmail == null || recipientEmail.isBlank()) return false;

        // Fetch active roadmap & pending milestone
        List<Roadmap> roadmaps = roadmapRepository.findByUserId(user.getId());
        Roadmap activeRoadmap = roadmaps.stream().filter(r -> "ACTIVE".equalsIgnoreCase(r.getStatus())).findFirst()
                .orElse(roadmaps.isEmpty() ? null : roadmaps.get(0));

        String nextPendingSkill = "Continue your topological roadmap prerequisites";
        if (activeRoadmap != null && activeRoadmap.getMilestones() != null) {
            for (Milestone m : activeRoadmap.getMilestones()) {
                if (m.getItems() != null) {
                    for (RoadmapItem item : m.getItems()) {
                        if (!"COMPLETED".equalsIgnoreCase(item.getStatus()) && item.getCatalogItem() != null) {
                            nextPendingSkill = item.getCatalogItem().getTitle() + " (" + m.getTitle() + ")";
                            break;
                        }
                    }
                }
                if (!nextPendingSkill.equals("Continue your topological roadmap prerequisites")) break;
            }
        }

        int streak = profile.getStreakCount() != null ? profile.getStreakCount() : 1;
        String goal = profile.getGoal() != null ? profile.getGoal() : "Software Engineering";

        String subject = "🔥 Keep your " + streak + "-day streak alive on PathWise!";
        String htmlContent = buildReminderEmailHtml(recipientEmail, goal, streak, nextPendingSkill);

        // Dispatched formatted HTML email (logged and ready for SMTP/Webhook pipe)
        log.info("📧 [PATHWISE EMAIL DISPATCH] To: {} | Subject: {} | Streak: {} | Next: {}", 
                recipientEmail, subject, streak, nextPendingSkill);
        log.debug("Email HTML Payload: {}", htmlContent);
        return true;
    }

    private String buildReminderEmailHtml(String email, String goal, int streak, String nextPendingSkill) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; }
                .card { max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .header { text-align: center; margin-bottom: 24px; }
                .logo { display: inline-block; width: 44px; height: 44px; background: #5051F9; color: #FFFFFF; font-weight: 900; font-size: 18px; line-height: 44px; border-radius: 12px; margin-bottom: 12px; }
                .title { font-size: 20px; font-weight: 800; color: #0F172A; margin: 0 0 6px 0; }
                .streak-pill { display: inline-block; background: #FEF3C7; color: #D97706; font-weight: 800; font-size: 12px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; }
                .content-box { background: #F1F5F9; border-radius: 14px; padding: 16px; margin: 20px 0; border-left: 4px solid #5051F9; text-align: left; }
                .btn { display: block; text-align: center; background: #5051F9; color: #FFFFFF; font-weight: 800; font-size: 14px; padding: 14px 24px; border-radius: 9999px; text-decoration: none; margin: 24px 0 12px 0; }
                .footer { text-align: center; font-size: 11px; color: #94A3B8; margin-top: 24px; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="header">
                  <div class="logo">PW</div>
                  <h1 class="title">Time for Today's Learning Session!</h1>
                  <div class="streak-pill">🔥 %d-Day Active Streak</div>
                  <p style="font-size: 13px; color: #64748B; margin: 0;">Target Track: <strong>%s</strong></p>
                </div>
                
                <div class="content-box">
                  <p style="font-size: 11px; font-weight: 800; color: #5051F9; text-transform: uppercase; margin: 0 0 4px 0;">🎯 Up Next in Your Roadmap:</p>
                  <p style="font-size: 14px; font-weight: 700; color: #1E293B; margin: 0;">%s</p>
                </div>
                
                <p style="font-size: 13px; color: #475569; line-height: 1.5;">Just 15–20 minutes of daily milestone execution cuts skill drop-out rates and keeps your proof-of-skill portfolio growing.</p>
                
                <a href="http://localhost:5173/roadmap" class="btn">🚀 Resume Learning Now</a>
                
                <div class="footer">
                  You are receiving this because you enabled Daily Reminders on PathWise for %s.<br/>
                  Manage your notification preferences anytime in <a href="http://localhost:5173/settings" style="color: #5051F9;">Settings</a>.
                </div>
              </div>
            </body>
            </html>
            """.formatted(streak, goal, nextPendingSkill, email);
    }
}
