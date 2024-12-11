package com.pluxity.ktds.domains.poi_set.repository;

import com.pluxity.ktds.domains.building.entity.Building;
import com.pluxity.ktds.domains.poi_set.entity.PoiSet;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PoiSetRepository extends JpaRepository<PoiSet, Long> {

    Optional<PoiSet> findByName(@NotNull String name);

    @Override
    @EntityGraph(attributePaths = {"poiCategories", "poiCategories.imageFile"})
    List<PoiSet> findAll();

    @Override
    @EntityGraph(attributePaths = {"poiCategories", "poiCategories.imageFile"})
    Optional<PoiSet> findById(@Param(value = "id") Long id);

    @Query("""
            SELECT b FROM Building b
            JOIN FETCH b.poiSet
            WHERE b.id = :id
            """)
    List<Building> findByPoiSetId(@Param(value = "id") Long id);
}
