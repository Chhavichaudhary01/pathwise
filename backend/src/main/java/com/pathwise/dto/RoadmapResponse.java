package com.pathwise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapResponse {
    private UUID id;
    private String title;
    private String status;
    private OffsetDateTime createdAt;
    private List<MilestoneDto> milestones;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MilestoneDto {
        private UUID id;
        private String title;
        private String description;
        private Integer orderIndex;
        private List<RoadmapItemDto> items;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoadmapItemDto {
        private UUID id;
        private String status;
        private String feedback;
        private String aiExplanation;
        private Integer orderIndex;
        private CatalogItemDto catalogItem;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CatalogItemDto {
        private UUID id;
        private String title;
        private String description;
        private String format;
        private Double estimatedHours;
        private String provider;
        private String difficulty;
        private String url;
        private List<String> skills;
    }
}
