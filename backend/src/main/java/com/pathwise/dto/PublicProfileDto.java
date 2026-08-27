package com.pathwise.dto;

import com.pathwise.domain.VerifiedSkillBadge;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicProfileDto {
    private String username;
    private String displayName;
    private String email;
    private String avatarUrl;
    private String targetRole;
    private String bio;
    private int currentStreakDays;
    private int longestStreakDays;
    private int totalDaysActive;
    private int totalMasteredItems;
    private double totalHoursInvested;
    private double overallMasteryPercent;
    private String activeRoadmapTitle;
    private List<HeatmapDayDto> activityHeatmap;
    private List<VerifiedSkillBadge> verifiedBadges;
    private List<ProjectDto> completedProjects;
    private String vanityUrl;
    private String openGraphImageUrl;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HeatmapDayDto {
        private LocalDate date;
        private int count; // number of study sessions / modules
        private int level; // 0 to 4 intensity
        private double hours;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectDto {
        private String id;
        private String title;
        private String description;
        private List<String> techStack;
        private String estimatedHours;
        private String url;
    }
}
