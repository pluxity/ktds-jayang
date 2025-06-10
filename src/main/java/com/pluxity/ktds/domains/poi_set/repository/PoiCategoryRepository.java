package com.pluxity.ktds.domains.poi_set.repository;

import com.pluxity.ktds.domains.poi_set.entity.PoiCategory;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PoiCategoryRepository extends JpaRepository<PoiCategory, Long> {

    Optional<PoiCategory> findByName(@NotNull String name);

    @Override
    List<PoiCategory> findAll();

    @Override
    Optional<PoiCategory> findById(@Param(value = "id") Long id);

    boolean existsByName(String name);
}
