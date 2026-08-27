package com.pathwise.service;

import com.pathwise.domain.LearnerProfile;
import com.pathwise.domain.User;
import com.pathwise.repository.LearnerProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StreakService {

    private final LearnerProfileRepository profileRepository;

    /**
     * Records learner activity today and recalculates current/longest streak.
     */
    @Transactional
    public LearnerProfile recordActivity(UUID userId) {
        Optional<LearnerProfile> opt = profileRepository.findByUserId(userId);
        if (opt.isEmpty()) return null;

        LearnerProfile profile = opt.get();
        LocalDate today = LocalDate.now();
        LocalDate lastActive = profile.getLastActiveDate();

        int currentStreak = profile.getStreakCount() != null ? profile.getStreakCount() : 0;
        int longestStreak = profile.getLongestStreak() != null ? profile.getLongestStreak() : 0;

        if (lastActive == null) {
            currentStreak = 1;
        } else if (lastActive.equals(today)) {
            // Already recorded today, streak intact
            return profile;
        } else if (lastActive.equals(today.minusDays(1))) {
            // Active yesterday: increment streak!
            currentStreak += 1;
        } else {
            // Missed more than 1 day: reset streak to 1
            currentStreak = 1;
        }

        longestStreak = Math.max(longestStreak, currentStreak);

        profile.setStreakCount(currentStreak);
        profile.setLongestStreak(longestStreak);
        profile.setLastActiveDate(today);

        log.info("Updated streak for user {}: current={}, longest={}", userId, currentStreak, longestStreak);
        return profileRepository.save(profile);
    }
}
