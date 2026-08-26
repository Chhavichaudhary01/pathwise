package com.pathwise.repository;

import com.pathwise.domain.Roadmap;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoadmapRepository extends JpaRepository<Roadmap, UUID> {
    
    @EntityGraph(attributePaths = {"milestones", "milestones.items", "milestones.items.catalogItem", "milestones.items.catalogItem.itemSkills", "milestones.items.catalogItem.itemSkills.skill"})
    @Query("SELECT DISTINCT r FROM Roadmap r WHERE r.user.id = :userId ORDER BY r.createdAt DESC")
    List<Roadmap> findByUserId(@Param("userId") UUID userId);

    @EntityGraph(attributePaths = {"milestones", "milestones.items", "milestones.items.catalogItem", "milestones.items.catalogItem.itemSkills", "milestones.items.catalogItem.itemSkills.skill"})
    @Query("SELECT r FROM Roadmap r WHERE r.id = :id")
    Optional<Roadmap> findByIdWithDetails(@Param("id") UUID id);

    Optional<Roadmap> findByUserIdAndStatus(UUID userId, String status);
}
