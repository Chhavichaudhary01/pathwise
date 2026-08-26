package com.pathwise.repository;

import com.pathwise.domain.LearnerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface LearnerProfileRepository extends JpaRepository<LearnerProfile, UUID> {
    Optional<LearnerProfile> findByUserId(UUID userId);
    boolean existsByUserId(UUID userId);
}
