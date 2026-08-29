package com.pathwise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeAnalysisResponse {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BulletRewrite {
        private String original;
        private String improved;
        private String rationale;
    }

    private String targetRole;
    private int matchScore; // 0 to 100
    private String atsVerdict; // e.g. "Strong Match", "Competitive Foundation", "Key Gaps to Bridge"
    private List<String> extractedSkills;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private double estimatedWeeksToTarget;
    private int estimatedHoursToTarget;
    private String currentEstimatedSalary;
    private String targetEstimatedSalary;
    private String salaryIncreasePercent;
    private String executiveSummary;
    private List<BulletRewrite> bulletRewrites;
    private List<String> actionPlanSteps;
    private UUID bridgeRoadmapId;
}
