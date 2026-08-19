package com.pathwise.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "roadmap_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoadmapItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "milestone_id", nullable = false)
    private Milestone milestone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_item_id", nullable = false)
    private CatalogItem catalogItem;

    private String status;
    private String feedback;

    @Column(name = "ai_explanation")
    private String aiExplanation;

    @Column(name = "order_index")
    private Integer orderIndex;
}
