package com.pathwise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodingChallengeDto {
    private String skillName;
    private String topicTitle;
    private String challengeType; // "CODE_CHALLENGE" or "SCENARIO_ANALYSIS"
    private String title;
    private String difficulty;
    private int timeLimitSeconds;
    private String instructions;
    private String language;
    private String starterCode;
    private List<TestCaseDto> testCases;
    private List<ScenarioQuestionDto> scenarioQuestions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestCaseDto {
        private String id;
        private String description;
        private String inputCode;
        private String expectedOutput;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScenarioQuestionDto {
        private String id;
        private String scenario;
        private List<String> options;
        private int correctIndex;
        private String explanation;
    }
}
