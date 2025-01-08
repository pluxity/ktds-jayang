package com.pluxity.ktds.domains.poi_set.repository;

import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.poi_set.entity.PoiCategory;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PoiCategoryRepository extends JpaRepository<PoiCategory, Long> {

    Optional<PoiCategory> findByName(@NotNull String name);

    @EntityGraph(attributePaths = {"imageFile", "iconSets"})
    @Override
    List<PoiCategory> findAll();

    @Override
    @EntityGraph(attributePaths = {"imageFile", "iconSets"})
    Optional<PoiCategory> findById(@Param(value = "id") Long id);

    @EntityGraph(attributePaths = {"imageFile", "iconSets"})
    List<PoiCategory> findByIconSetsId(@Param(value = "id") Long id);

}
