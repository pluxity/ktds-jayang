package com.pluxity.ktds.domains.building.repostiory;

import com.pluxity.ktds.domains.building.entity.Building;
import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.building.entity.Spatial;
import com.pluxity.ktds.domains.poi_set.entity.PoiMiddleCategory;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PoiRepository extends JpaRepository<Poi, Long> {
    boolean existsByCode(String code);
    Optional<Poi> findByName(@NotNull String name);
    Optional<Poi> findByPoiCategoryId(@Param(value = "id") Long id);

    List<Poi> findBybuilding(Building building);
    List<Poi> findPoisByBuildingId(@Param(value = "id") Long id);

    boolean existsByBuilding(Building building);

    void deleteByBuilding(Building building);
    Optional<Poi> findByFloorNo(@Param(value = "floorNo") Integer floorNo);
    List<Poi> findPoisByPoiCategoryId(@Param(value = "id") Long id);
    List<Poi> findPoisByFloorNo(@Param(value = "floorNo") Integer floorNo);
    @Query("SELECT p FROM Poi p JOIN p.tagNames t WHERE t = :tagName")
    Poi findPoiByTagName(@Param("tagName") String tagName);

    boolean existsByName(String name);

    boolean existsByPoiMiddleCategoryId(Long id);

    @Query("SELECT p FROM Poi p JOIN p.tagNames t WHERE t IN :tagNames")
    List<Poi> findByTagNamesIn(@Param("tagNames") List<String> tagNames);

    List<Poi> findByPoiMiddleCategoryId(Long id);
    @Query("SELECT p FROM Poi p JOIN p.poiCategory c WHERE c.name = :name")
    List<Poi> findByCategoryName(@Param("name") String categoryName);
    @Query("SELECT p FROM Poi p JOIN p.poiMiddleCategory c WHERE c.name = :name")
    List<Poi> findByMiddleCategoryName(@Param("name") String middleCategoryName);
    @Query("SELECT p FROM Poi p JOIN p.poiMiddleCategory c WHERE c.name = :name AND p.building.id = :buildingId")
    List<Poi> findByBuildingIdAndMiddleCategoryName(@Param("buildingId") Long buildingId, @Param("name") String middleCategoryName);

    @Query("SELECT p FROM Poi p WHERE p.position.x IS NOT NULL AND p.position.y IS NOT NULL AND p.position.z IS NOT NULL")
    List<Poi> findAllWithPositionPresent();
}
