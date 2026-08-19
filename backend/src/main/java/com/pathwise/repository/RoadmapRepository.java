package com.pathwise.repository;

import com.pathwise.domain.Roadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoadmapRepository extends JpaRepository<Roadmap, UUID> {
    List<Roadmap> findByUserId(UUID userId);
    Optional<Roadmap> findByUserIdAndStatus(UUID userId, String status);
}
