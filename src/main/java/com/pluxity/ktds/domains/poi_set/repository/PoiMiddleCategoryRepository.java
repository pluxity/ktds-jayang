package com.pluxity.ktds.domains.poi_set.repository;

import com.pluxity.ktds.domains.poi_set.entity.PoiCategory;
import com.pluxity.ktds.domains.poi_set.entity.PoiMiddleCategory;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PoiMiddleCategoryRepository extends JpaRepository<PoiMiddleCategory, Long> {
    Optional<PoiMiddleCategory> findByName(String name);
    Optional<PoiCategory> findByPoiCategoryId(@Param(value = "id") Long id);
}
