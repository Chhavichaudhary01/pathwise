package com.pathwise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeMintResponse {
    private UUID badgeId;
    private String skillName;
    private String topicTitle;
    private int score;
    private String verificationHash;
    private String badgeTier;
    private OffsetDateTime issuedAt;
    private String verificationUrl;
    private String message;
    private boolean passed;
}
