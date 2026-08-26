package com.pathwise.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.util.Set;
import java.util.LinkedHashSet;

@Entity
@Table(name = "milestones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Milestone {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roadmap_id", nullable = false)
    private Roadmap roadmap;

    private String title;
    private String description;

    @Column(name = "order_index")
    private Integer orderIndex;

    @OneToMany(mappedBy = "milestone", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private Set<RoadmapItem> items = new LinkedHashSet<>();
}
