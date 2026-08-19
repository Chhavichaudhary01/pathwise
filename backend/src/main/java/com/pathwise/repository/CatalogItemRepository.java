package com.pathwise.repository;

import com.pathwise.domain.CatalogItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CatalogItemRepository extends JpaRepository<CatalogItem, UUID> {
}
