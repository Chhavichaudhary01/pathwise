package com.pathwise.service;

import com.pathwise.domain.LearnerProfile;
import com.pathwise.domain.Milestone;
import com.pathwise.domain.Roadmap;
import com.pathwise.domain.RoadmapItem;
import com.pathwise.domain.User;
import com.pathwise.dto.ScheduleTimelineResponse;
import com.pathwise.dto.ScheduleTimelineResponse.MilestoneScheduleDto;
import com.pathwise.dto.ScheduleTimelineResponse.StudySessionDto;
import com.pathwise.repository.LearnerProfileRepository;
import com.pathwise.repository.RoadmapRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SchedulePlannerService {

    private final RoadmapRepository roadmapRepository;
    private final LearnerProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public ScheduleTimelineResponse calculateTimeline(User user, Integer customWeeklyHours) {
        // Resolve Weekly Hours
        LearnerProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        int weeklyHours = customWeeklyHours != null && customWeeklyHours > 0 
                ? customWeeklyHours 
                : (profile != null && profile.getWeeklyHours() != null ? profile.getWeeklyHours() : 10);

        // Fetch User Roadmap
        List<Roadmap> roadmaps = roadmapRepository.findByUserId(user.getId());
        Roadmap roadmap = roadmaps.stream().filter(r -> "ACTIVE".equalsIgnoreCase(r.getStatus())).findFirst()
                .orElse(roadmaps.isEmpty() ? null : roadmaps.get(0));

        if (roadmap == null) {
            return generateDefaultTimeline(weeklyHours);
        }

        double totalHours = 0;
        double completedHours = 0;
        List<MilestoneScheduleDto> milestoneDtos = new ArrayList<>();
        LocalDate currentDateCursor = LocalDate.now();

        List<Milestone> milestones = roadmap.getMilestones() != null 
                ? new ArrayList<>(roadmap.getMilestones()) 
                : new ArrayList<>();
        milestones.sort(Comparator.comparingInt(m -> m.getOrderIndex() != null ? m.getOrderIndex() : 0));

        List<String> nextActiveDeliverables = new ArrayList<>();

        for (Milestone m : milestones) {
            double phaseHours = 0;
            int phaseItems = 0;
            int phaseCompleted = 0;
            List<String> deliverables = new ArrayList<>();

            if (m.getItems() != null) {
                for (RoadmapItem item : m.getItems()) {
                    phaseItems++;
                    double itemHours = item.getCatalogItem() != null && item.getCatalogItem().getEstimatedHours() != null
                            ? item.getCatalogItem().getEstimatedHours().doubleValue()
                            : 5.0;
                    phaseHours += itemHours;

                    if ("COMPLETED".equalsIgnoreCase(item.getStatus())) {
                        phaseCompleted++;
                        completedHours += itemHours;
                    } else {
                        if (deliverables.size() < 3 && item.getCatalogItem() != null) {
                            deliverables.add(item.getCatalogItem().getTitle());
                            if (nextActiveDeliverables.size() < 3) {
                                nextActiveDeliverables.add(item.getCatalogItem().getTitle());
                            }
                        }
                    }
                }
            }

            if (phaseHours <= 0) phaseHours = 15.0;
            totalHours += phaseHours;

            // Calculate duration in days given weekly hours pace
            double dailyPace = (double) weeklyHours / 7.0;
            int phaseDays = Math.max(3, (int) Math.ceil(phaseHours / dailyPace));

            LocalDate startDate = currentDateCursor;
            LocalDate completionDate = startDate.plusDays(phaseDays);

            String status = phaseCompleted == phaseItems && phaseItems > 0
                    ? "COMPLETED"
                    : (phaseCompleted > 0 || milestoneDtos.isEmpty() || milestoneDtos.stream().allMatch(p -> "COMPLETED".equals(p.getStatus()))
                    ? "IN_PROGRESS"
                    : "UPCOMING");

            milestoneDtos.add(MilestoneScheduleDto.builder()
                    .milestoneId(m.getId() != null ? m.getId().toString() : UUID.randomUUID().toString())
                    .phaseTitle(m.getTitle() != null ? m.getTitle() : "Phase " + (milestoneDtos.size() + 1))
                    .orderIndex(m.getOrderIndex() != null ? m.getOrderIndex() : milestoneDtos.size() + 1)
                    .totalItems(phaseItems)
                    .completedItems(phaseCompleted)
                    .estimatedHours(phaseHours)
                    .targetStartDate(startDate)
                    .targetCompletionDate(completionDate)
                    .status(status)
                    .keyDeliverables(deliverables.isEmpty() ? List.of("Mastery assessments & prerequisite checkpoints") : deliverables)
                    .build());

            // Advance date cursor for next phase
            currentDateCursor = completionDate.plusDays(1);
        }

        double remainingHours = Math.max(0, totalHours - completedHours);
        int remainingWeeks = Math.max(1, (int) Math.ceil(remainingHours / (double) weeklyHours));
        LocalDate graduationDate = LocalDate.now().plusWeeks(remainingWeeks);
        double progressPercent = totalHours > 0 ? Math.round((completedHours / totalHours) * 100.0) : 0.0;

        // Generate next 4 upcoming study sessions (e.g. Tue, Thu, Sat)
        List<StudySessionDto> studySessions = generateUpcomingStudySessions(roadmap.getTitle(), nextActiveDeliverables);

        String googleQuickAddUrl = generateGoogleCalendarUrl(
                "PathWise Study Block: " + roadmap.getTitle(),
                "Dedicated study session for PathWise roadmap milestones: " + String.join(", ", nextActiveDeliverables),
                LocalDate.now().plusDays(1),
                "19:00",
                "20:30"
        );

        return ScheduleTimelineResponse.builder()
                .roadmapTitle(roadmap.getTitle())
                .weeklyHours(weeklyHours)
                .totalEstimatedHours(totalHours)
                .completedHours(completedHours)
                .remainingHours(remainingHours)
                .progressPercent(progressPercent)
                .estimatedWeeksRemaining(remainingWeeks)
                .estimatedGraduationDate(graduationDate)
                .milestoneSchedules(milestoneDtos)
                .scheduledStudyBlocks(studySessions)
                .googleCalendarQuickAddUrl(googleQuickAddUrl)
                .build();
    }

    @Transactional
    public void updateWeeklyCommitment(User user, int weeklyHours) {
        LearnerProfile profile = profileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    LearnerProfile p = new LearnerProfile();
                    p.setUser(user);
                    return p;
                });
        profile.setWeeklyHours(weeklyHours);
        profileRepository.save(profile);
    }

    /**
     * Generate standard RFC 5545 iCalendar .ics file content
     */
    @Transactional(readOnly = true)
    public String generateIcsCalendar(User user) {
        ScheduleTimelineResponse timeline = calculateTimeline(user, null);
        StringBuilder ics = new StringBuilder();
        
        ics.append("BEGIN:VCALENDAR\r\n");
        ics.append("VERSION:2.0\r\n");
        ics.append("PRODID:-//PathWise//Career Learning Schedule 2.0//EN\r\n");
        ics.append("CALSCALE:GREGORIAN\r\n");
        ics.append("METHOD:PUBLISH\r\n");
        ics.append("X-WR-CALNAME:PathWise - ").append(escapeIcs(timeline.getRoadmapTitle())).append("\r\n");
        ics.append("X-WR-TIMEZONE:UTC\r\n");

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyyMMdd");

        // 1. Add Milestone Deadline Events
        if (timeline.getMilestoneSchedules() != null) {
            for (MilestoneScheduleDto m : timeline.getMilestoneSchedules()) {
                String uid = "milestone-" + m.getOrderIndex() + "-" + UUID.randomUUID().toString().substring(0, 8) + "@pathwise.io";
                String dtStart = m.getTargetCompletionDate().format(dtf) + "T180000Z";
                String dtEnd = m.getTargetCompletionDate().format(dtf) + "T190000Z";

                ics.append("BEGIN:VEVENT\r\n");
                ics.append("UID:").append(uid).append("\r\n");
                ics.append("DTSTAMP:").append(LocalDate.now().format(dtf)).append("T000000Z\r\n");
                ics.append("DTSTART:").append(dtStart).append("\r\n");
                ics.append("DTEND:").append(dtEnd).append("\r\n");
                ics.append("SUMMARY:🎯 Milestone Target: ").append(escapeIcs(m.getPhaseTitle())).append("\r\n");
                ics.append("DESCRIPTION:").append(escapeIcs("PathWise Milestone Target Deadline. Deliverables: " + String.join(", ", m.getKeyDeliverables()))).append("\r\n");
                ics.append("STATUS:CONFIRMED\r\n");
                
                // Add 1-day reminder alarm
                ics.append("BEGIN:VALARM\r\n");
                ics.append("TRIGGER:-P1D\r\n");
                ics.append("ACTION:DISPLAY\r\n");
                ics.append("DESCRIPTION:Reminder: PathWise Milestone Deadline Tomorrow!\r\n");
                ics.append("END:VALARM\r\n");

                ics.append("END:VEVENT\r\n");
            }
        }

        // 2. Add Recurring Weekly Study Blocks
        if (timeline.getScheduledStudyBlocks() != null) {
            for (StudySessionDto s : timeline.getScheduledStudyBlocks()) {
                String uid = "study-" + s.getId() + "@pathwise.io";
                String dtStart = s.getDate().format(dtf) + "T" + s.getStartTime().replace(":", "") + "00Z";
                String dtEnd = s.getDate().format(dtf) + "T" + s.getEndTime().replace(":", "") + "00Z";

                ics.append("BEGIN:VEVENT\r\n");
                ics.append("UID:").append(uid).append("\r\n");
                ics.append("DTSTAMP:").append(LocalDate.now().format(dtf)).append("T000000Z\r\n");
                ics.append("DTSTART:").append(dtStart).append("\r\n");
                ics.append("DTEND:").append(dtEnd).append("\r\n");
                ics.append("SUMMARY:⚡ ").append(escapeIcs(s.getTitle())).append("\r\n");
                ics.append("DESCRIPTION:").append(escapeIcs(s.getDescription())).append("\r\n");
                ics.append("STATUS:CONFIRMED\r\n");

                // Add 15-minute alarm
                ics.append("BEGIN:VALARM\r\n");
                ics.append("TRIGGER:-PT15M\r\n");
                ics.append("ACTION:DISPLAY\r\n");
                ics.append("DESCRIPTION:Time for your PathWise Study Session!\r\n");
                ics.append("END:VALARM\r\n");

                ics.append("END:VEVENT\r\n");
            }
        }

        ics.append("END:VCALENDAR\r\n");
        return ics.toString();
    }

    private List<StudySessionDto> generateUpcomingStudySessions(String roadmapTitle, List<String> deliverables) {
        List<StudySessionDto> sessions = new ArrayList<>();
        LocalDate today = LocalDate.now();
        String desc = "Dedicated study focus on: " + (deliverables.isEmpty() ? "Core Prerequisites & Projects" : String.join(", ", deliverables));

        // Schedule next 4 study days: Tue (19:00), Thu (19:00), Sat (10:00), Sun (14:00)
        int[] dayOffsets = {1, 3, 5, 6};
        String[] startTimes = {"19:00", "19:00", "10:00", "14:00"};
        String[] endTimes = {"20:30", "20:30", "12:00", "16:00"};
        double[] durations = {1.5, 1.5, 2.0, 2.0};

        for (int i = 0; i < 4; i++) {
            LocalDate sessionDate = today.plusDays(dayOffsets[i]);
            String title = "PathWise Study Sprint: " + roadmapTitle;
            String url = generateGoogleCalendarUrl(title, desc, sessionDate, startTimes[i], endTimes[i]);

            sessions.add(StudySessionDto.builder()
                    .id("session_" + (i + 1))
                    .title(title)
                    .description(desc)
                    .date(sessionDate)
                    .startTime(startTimes[i])
                    .endTime(endTimes[i])
                    .durationHours(durations[i])
                    .googleCalendarUrl(url)
                    .build());
        }

        return sessions;
    }

    public String generateGoogleCalendarUrl(String title, String details, LocalDate date, String startTime, String endTime) {
        try {
            String dateFormatted = date.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String startFormatted = startTime.replace(":", "") + "00";
            String endFormatted = endTime.replace(":", "") + "00";
            String datesParam = dateFormatted + "T" + startFormatted + "/" + dateFormatted + "T" + endFormatted;

            return "https://calendar.google.com/calendar/render?action=TEMPLATE" +
                    "&text=" + URLEncoder.encode(title, StandardCharsets.UTF_8) +
                    "&dates=" + datesParam +
                    "&details=" + URLEncoder.encode(details + "\n\nTrack progress on http://localhost:5173/planner", StandardCharsets.UTF_8) +
                    "&location=" + URLEncoder.encode("PathWise Virtual Workspace", StandardCharsets.UTF_8);
        } catch (Exception e) {
            return "https://calendar.google.com";
        }
    }

    private ScheduleTimelineResponse generateDefaultTimeline(int weeklyHours) {
        LocalDate today = LocalDate.now();
        return ScheduleTimelineResponse.builder()
                .roadmapTitle("Personalized Career Path")
                .weeklyHours(weeklyHours)
                .totalEstimatedHours(45.0)
                .completedHours(0.0)
                .remainingHours(45.0)
                .progressPercent(0.0)
                .estimatedWeeksRemaining(5)
                .estimatedGraduationDate(today.plusWeeks(5))
                .milestoneSchedules(List.of(
                        MilestoneScheduleDto.builder()
                                .milestoneId(UUID.randomUUID().toString())
                                .phaseTitle("Phase 1: Foundations & Core Prerequisites")
                                .orderIndex(1)
                                .totalItems(3)
                                .completedItems(0)
                                .estimatedHours(15.0)
                                .targetStartDate(today)
                                .targetCompletionDate(today.plusDays(10))
                                .status("IN_PROGRESS")
                                .keyDeliverables(List.of("Syntax & Fundamentals", "Hands-on Starter Project"))
                                .build(),
                        MilestoneScheduleDto.builder()
                                .milestoneId(UUID.randomUUID().toString())
                                .phaseTitle("Phase 2: Applied Skills & Architecture")
                                .orderIndex(2)
                                .totalItems(4)
                                .completedItems(0)
                                .estimatedHours(18.0)
                                .targetStartDate(today.plusDays(11))
                                .targetCompletionDate(today.plusDays(24))
                                .status("UPCOMING")
                                .keyDeliverables(List.of("State Management", "API Integrations"))
                                .build(),
                        MilestoneScheduleDto.builder()
                                .milestoneId(UUID.randomUUID().toString())
                                .phaseTitle("Phase 3: Advanced Topics & Capstone")
                                .orderIndex(3)
                                .totalItems(3)
                                .completedItems(0)
                                .estimatedHours(12.0)
                                .targetStartDate(today.plusDays(25))
                                .targetCompletionDate(today.plusDays(35))
                                .status("UPCOMING")
                                .keyDeliverables(List.of("Production Deployment", "Capstone Project"))
                                .build()
                ))
                .scheduledStudyBlocks(generateUpcomingStudySessions("Full Stack Career Path", List.of("Core Prerequisites")))
                .googleCalendarQuickAddUrl(generateGoogleCalendarUrl("PathWise Study Sprint", "Milestone Study Session", today.plusDays(1), "19:00", "20:30"))
                .build();
    }

    private String escapeIcs(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                .replace(";", "\\;")
                .replace(",", "\\,")
                .replace("\n", "\\n")
                .replace("\r", "");
    }
}
