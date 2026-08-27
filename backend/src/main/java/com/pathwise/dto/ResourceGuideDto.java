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
public class ResourceGuideDto {
    private String topic;
    private String category;
    private String difficulty;
    private String estimatedReadTime;
    private String summary;
    private List<String> prerequisites;
    private List<String> learningObjectives;
    private String deepDiveMarkdown;
    private List<CodeExampleDto> codeExamples;
    private List<String> commonPitfalls;
    private List<String> bestPractices;
    private List<ExerciseDto> practicalExercises;
    private List<DocReferenceDto> authoritativeCitations;
    private UUID roadmapItemId;
    private String roadmapItemStatus;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CodeExampleDto {
        private String title;
        private String language;
        private String filename;
        private String code;
        private String explanation;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExerciseDto {
        private String title;
        private String description;
        private String difficulty;
        private String starterCode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocReferenceDto {
        private String title;
        private String domain;
        private String url;
        private String description;
    }
}
