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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String goal;

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

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
