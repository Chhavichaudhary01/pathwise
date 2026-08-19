package com.pathwise.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.Set;

@Entity
@Table(name = "catalog_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CatalogItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;
    private String description;
    private String format;

    @Column(name = "estimated_hours")
    private BigDecimal estimatedHours;

    private String provider;
    private String difficulty;
    private String url;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String embedding;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "catalogItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CatalogItemSkill> itemSkills;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
