package com.pathwise.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "verified_skill_badges")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VerifiedSkillBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "skill_name", nullable = false)
    private String skillName;

    @Column(name = "topic_title")
    private String topicTitle;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "verification_hash", nullable = false)
    private String verificationHash;

    @Column(name = "challenge_type")
    private String challengeType;

    @Column(name = "badge_tier")
    private String badgeTier;

    @Column(name = "issued_at")
    private OffsetDateTime issuedAt;

    @PrePersist
    protected void onCreate() {
        if (issuedAt == null) {
            issuedAt = OffsetDateTime.now();
        }
        if (badgeTier == null) {
            badgeTier = "DIAMOND";
        }
    }
}
