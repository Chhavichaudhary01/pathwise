package com.pathwise.repository;

import com.pathwise.domain.RoadmapItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface RoadmapItemRepository extends JpaRepository<RoadmapItem, UUID> {
}
