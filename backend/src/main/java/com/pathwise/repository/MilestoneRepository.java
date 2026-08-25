package com.pathwise.repository;

import com.pathwise.domain.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface MilestoneRepository extends JpaRepository<Milestone, UUID> {
}
