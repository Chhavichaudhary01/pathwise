package com.pathwise.repository;

import com.pathwise.domain.VerifiedSkillBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VerifiedSkillBadgeRepository extends JpaRepository<VerifiedSkillBadge, UUID> {
    
    @Query("SELECT b FROM VerifiedSkillBadge b WHERE b.user.id = :userId ORDER BY b.issuedAt DESC")
    List<VerifiedSkillBadge> findByUserId(@Param("userId") UUID userId);

    Optional<VerifiedSkillBadge> findByVerificationHash(String verificationHash);

    @Query("SELECT b FROM VerifiedSkillBadge b WHERE b.user.id = :userId AND LOWER(b.skillName) = LOWER(:skillName)")
    Optional<VerifiedSkillBadge> findByUserIdAndSkillName(@Param("userId") UUID userId, @Param("skillName") String skillName);
}
