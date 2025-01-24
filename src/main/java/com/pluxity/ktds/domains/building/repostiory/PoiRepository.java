package com.pluxity.ktds.domains.building.repostiory;

import com.pluxity.ktds.domains.building.entity.Building;
import com.pluxity.ktds.domains.building.entity.Poi;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PoiRepository extends JpaRepository<Poi, Long> {
    boolean existsByCode(String code);
    Optional<Poi> findByName(@NotNull String name);
    Optional<Poi> findByPoiCategoryId(@Param(value = "id") Long id);

    List<Poi> findBybuilding(Building building);

    boolean existsByBuilding(Building building);

    void deleteByBuilding(Building building);
    Optional<Poi> findByFloorId(@Param(value = "id") Long id);
    List<Poi> findPoisByPoiCategoryId(@Param(value = "id") Long id);
    List<Poi> findPoisByfloorId(@Param(value = "id") Long id);
}
