package com.pathwise.repository;

import com.pathwise.domain.Roadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoadmapRepository extends JpaRepository<Roadmap, UUID> {
    
    @Query("SELECT DISTINCT r FROM Roadmap r LEFT JOIN FETCH r.milestones m WHERE r.user.id = :userId ORDER BY r.createdAt DESC")
    List<Roadmap> findByUserId(@Param("userId") UUID userId);

    @Query("SELECT DISTINCT r FROM Roadmap r " +
           "LEFT JOIN FETCH r.milestones m " +
           "LEFT JOIN FETCH m.items i " +
           "LEFT JOIN FETCH i.catalogItem ci " +
           "WHERE r.id = :id")
    Optional<Roadmap> findByIdWithDetails(@Param("id") UUID id);

    Optional<Roadmap> findByUserIdAndStatus(UUID userId, String status);
}
