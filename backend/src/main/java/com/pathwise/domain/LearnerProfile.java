package com.pathwise.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "learner_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LearnerProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String goal;

    @Column(name = "avatar_url", columnDefinition = "text")
    private String avatarUrl;

    private Integer age;

    @Column(name = "class_grade")
    private String classGrade;

    private String board;

    private String address;

    @Column(name = "is_profile_complete")
    private Boolean isProfileComplete;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "current_skills", columnDefinition = "jsonb")
    private String currentSkills;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String interests;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "learning_history", columnDefinition = "jsonb")
    private String learningHistory;

    @Column(name = "weekly_hours")
    private Integer weeklyHours;

    @Column(name = "learning_style")
    private String learningStyle;

    @Column(name = "streak_count")
    private Integer streakCount;

    @Column(name = "longest_streak")
    private Integer longestStreak;

    @Column(name = "last_active_date")
    private java.time.LocalDate lastActiveDate;

    @Column(name = "daily_reminder_enabled")
    private Boolean dailyReminderEnabled;

    @Column(name = "daily_reminder_time")
    private String dailyReminderTime;

    @Column(name = "notification_email")
    private String notificationEmail;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
        if (isProfileComplete == null) {
            isProfileComplete = false;
        }
        if (streakCount == null) {
            streakCount = 1;
        }
        if (longestStreak == null) {
            longestStreak = 1;
        }
        if (lastActiveDate == null) {
            lastActiveDate = java.time.LocalDate.now();
        }
        if (dailyReminderEnabled == null) {
            dailyReminderEnabled = true;
        }
        if (dailyReminderTime == null) {
            dailyReminderTime = "09:00";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
