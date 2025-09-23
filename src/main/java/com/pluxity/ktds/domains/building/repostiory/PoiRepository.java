package com.pluxity.ktds.domains.building.repostiory;

import com.pluxity.ktds.domains.building.entity.Building;
import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.cctv.dto.PoiCctvDTO;
import com.pluxity.ktds.global.annotation.IgnoreBuildingPermission;
import com.pluxity.ktds.global.annotation.IgnorePoiPermission;
import com.pluxity.ktds.global.repository.BaseRepository;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface PoiRepository extends BaseRepository<Poi, Long> {
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

    @Query("SELECT p " +
            "FROM Poi p JOIN FETCH p.poiTags pt WHERE pt.tagName = :tagName")
    Optional<Poi> findPoiByTagName(@Param("tagName") String tagName);

    @Query("SELECT new com.pluxity.ktds.domains.cctv.dto.PoiCctvDTO(p.id, pc.cctvName, pc.isMain, p.cameraIp) " +
            "FROM Poi p join PoiCctv pc on p.name = pc.cctvName "+
            "where pc.cctvName IN :cctvNames")
    List<PoiCctvDTO> findByCctvNames(List<String> cctvNames);

    boolean existsByName(String name);

    boolean existsByPoiMiddleCategoryId(Long id);

    List<Poi> findByPoiCategoryIdIn(Set<Long> poiCategoryIds);

    @Query("SELECT DISTINCT p FROM Poi p JOIN p.poiTags pt WHERE pt.tagName IN :tagNames")
    List<Poi> findByTagNamesIn(@Param("tagNames") List<String> tagNames);

    List<Poi> findByPoiMiddleCategoryId(Long id);
    @Query("SELECT p FROM Poi p JOIN p.poiCategory c WHERE c.name = :name")
    List<Poi> findByCategoryName(@Param("name") String categoryName);

    @Query("SELECT p " +
            "FROM Poi p " +
            "LEFT JOIN FETCH p.poiTags " +
            "WHERE p.poiMiddleCategory.name = :middleCategoryName")
    List<Poi> findByMiddleCategoryName(@Param("middleCategoryName") String middleCategoryName);

    @Query("SELECT p FROM Poi p WHERE p.position.x IS NOT NULL AND p.position.y IS NOT NULL AND p.position.z IS NOT NULL")
    List<Poi> findAllWithPositionPresent();

    @Query("SELECT p " +
            "FROM Poi p " +
            "LEFT JOIN FETCH p.poiTags " +
            "LEFT JOIN FETCH p.building " +
            "WHERE p.building.id = :buildingId " +
            "AND p.poiMiddleCategory.name = :middleCategoryName")
    List<Poi> findByBuildingIdAndMiddleCategoryName(@Param("buildingId") Long buildingId, @Param("middleCategoryName") String middleCategoryName);

    @Query("SELECT EXISTS (" +
            "SELECT 1 FROM Poi p " +
            "JOIN p.poiCategory pc " +
            "WHERE pc.name = 'CCTV' AND p.name = :poiName " +
            "AND p.building.id = :buildingId)")
    boolean existsCctvPoiByNameAndBuildingId(@Param("poiName") String poiName,
                             @Param("buildingId") Long buildingId);

    @Query("SELECT p FROM Poi p " +
       "JOIN FETCH p.building b " +
       "JOIN FETCH p.poiCategory pc " +
       "JOIN FETCH p.poiMiddleCategory pmc " +
       "JOIN FETCH p.poiTags pt "+
       "ORDER BY p.id DESC")
    Page<Poi> findAllForPaging(Pageable pageable);

    @Query("SELECT p FROM Poi p " +
        "JOIN FETCH p.building b " +
        "JOIN FETCH p.poiCategory pc " +
        "JOIN FETCH p.poiMiddleCategory pmc " +
        "JOIN FETCH p.poiTags pt "+
        "WHERE (:buildingId IS NULL OR p.building.id = :buildingId) " +
        "AND (:floorNo IS NULL OR p.floorNo = :floorNo) " +
        "AND (:poiCategoryId IS NULL OR p.poiCategory.id = :poiCategoryId) " +
        "AND (:keywordType IS NULL OR :keyword IS NULL OR " +
        "     (:keywordType = 'name' AND LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
        "     (:keywordType = 'code' AND LOWER(p.code) LIKE LOWER(CONCAT('%', :keyword, '%')))) " +
        "ORDER BY p.id DESC")
        Page<Poi> findAllForPagingWithSearch(
        Pageable pageable,
        @Param("buildingId") Long buildingId,
        @Param("floorNo") Integer floorNo,
        @Param("poiCategoryId") Long poiCategoryId,
        @Param("keywordType") String keywordType,
        @Param("keyword") String keyword
);

    @Query("SELECT p.id FROM Poi p ORDER BY p.id DESC")
    @IgnorePoiPermission
    @IgnoreBuildingPermission
    Page<Long> findPoiIdsForPaging(Pageable pageable);

    @Query("SELECT p.id FROM Poi p " +
            "WHERE (:buildingId IS NULL OR p.building.id = :buildingId) " +
            "AND (:floorNo IS NULL OR p.floorNo = :floorNo) " +
            "AND (:poiCategoryId IS NULL OR p.poiCategory.id = :poiCategoryId) " +
            "AND (:keywordType IS NULL OR :keyword IS NULL OR " +
            "     (:keywordType = 'name' AND LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
            "     (:keywordType = 'code' AND LOWER(p.code) LIKE LOWER(CONCAT('%', :keyword, '%')))) " +
            "ORDER BY p.id DESC")
    Page<Long> findPoiIdsForPagingWithSearch(
            Pageable pageable,
            @Param("buildingId") Long buildingId,
            @Param("floorNo") Integer floorNo,
            @Param("poiCategoryId") Long poiCategoryId,
            @Param("keywordType") String keywordType,
            @Param("keyword") String keyword
    );

    @Query("SELECT p FROM Poi p " +
            "JOIN FETCH p.building b " +
            "JOIN FETCH p.poiCategory pc " +
            "JOIN FETCH p.poiMiddleCategory pmc " +
            "JOIN FETCH p.poiTags pt " +
            "WHERE p.id IN :poiIds " +
            "ORDER BY p.id DESC")
    List<Poi> findByIdsWithJoins(@Param("poiIds") List<Long> poiIds);

}
