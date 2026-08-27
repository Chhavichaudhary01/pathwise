package com.pathwise.dto;

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
public class ScheduleTimelineResponse {
    private String roadmapTitle;
    private int weeklyHours;
    private double totalEstimatedHours;
    private double completedHours;
    private double remainingHours;
    private double progressPercent;
    private int estimatedWeeksRemaining;
    private LocalDate estimatedGraduationDate;
    private List<MilestoneScheduleDto> milestoneSchedules;
    private List<StudySessionDto> scheduledStudyBlocks;
    private String googleCalendarQuickAddUrl;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MilestoneScheduleDto {
        private String milestoneId;
        private String phaseTitle;
        private int orderIndex;
        private int totalItems;
        private int completedItems;
        private double estimatedHours;
        private LocalDate targetStartDate;
        private LocalDate targetCompletionDate;
        private String status; // "COMPLETED" | "IN_PROGRESS" | "UPCOMING"
        private List<String> keyDeliverables;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudySessionDto {
        private String id;
        private String title;
        private String description;
        private LocalDate date;
        private String startTime;
        private String endTime;
        private double durationHours;
        private String googleCalendarUrl;
    }
}
