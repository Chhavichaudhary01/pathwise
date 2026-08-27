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
    private String targetRole;
    private int matchScore; // 0 to 100
    private List<String> extractedSkills;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private double estimatedWeeksToTarget;
    private int estimatedHoursToTarget;
    private String currentEstimatedSalary;
    private String targetEstimatedSalary;
    private String salaryIncreasePercent;
    private String executiveSummary;
    private UUID bridgeRoadmapId;
}
