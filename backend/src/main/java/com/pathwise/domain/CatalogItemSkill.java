package com.pathwise.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "catalog_item_skills")
@IdClass(CatalogItemSkillId.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CatalogItemSkill {
    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_item_id")
    private CatalogItem catalogItem;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id")
    private Skill skill;

    @Id
    @Column(name = "is_prerequisite")
    private boolean isPrerequisite;

    @Column(name = "is_outcome")
    private boolean isOutcome;
}
