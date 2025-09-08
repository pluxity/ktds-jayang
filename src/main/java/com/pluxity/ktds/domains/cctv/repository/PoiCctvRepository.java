package com.pluxity.ktds.domains.cctv.repository;

import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.cctv.dto.PoiCctvResponseDTO;
import com.pluxity.ktds.domains.cctv.entity.PoiCctv;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface PoiCctvRepository extends JpaRepository<PoiCctv, Long> {
    List<PoiCctv> findAllByPoi(Poi poi);
    List<PoiCctv> findAllByPoiIn(List<Poi> poiList);

    @Query("SELECT new com.pluxity.ktds.domains.cctv.dto.PoiCctvResponseDTO(p.id, p1.id) " +
            "FROM PoiCctv poiCctv " +
            "JOIN Poi p ON poiCctv.cctvName = p.name " +
            "JOIN Poi p1 ON poiCctv.poi = p1 " +
            "WHERE p.building.id = :buildingId AND p.floorNo = :floorNo AND poiCctv.isMain = 'Y' " +
            "AND p.position.x IS NOT NULL AND p.position.y IS NOT NULL AND p.position.z IS NOT NULL " +
            "AND p1.position.x IS NOT NULL AND p1.position.y IS NOT NULL AND p1.position.z IS NOT NULL")
    List<PoiCctvResponseDTO> findByBuildingIdAndFloorNo(
            @Param("buildingId") Long buildingId,
            @Param("floorNo") Integer floorNo);


    @Modifying
    @Transactional
    @Query("DELETE FROM PoiCctv pc " +
            "WHERE pc.cctvName IN " +
            "(SELECT p.name FROM Poi p WHERE p.building.id = :buildingId AND p.floorNo = :floorNo)")
    void deleteByBuildingIdAndFloorNo(
            @Param("buildingId") Long buildingId,
            @Param("floorNo") Integer floorNo);

    @Modifying
    @Transactional
    @Query("DELETE FROM PoiCctv pc WHERE pc.cctvName = :cctvName")
    void deleteByCctvName(String cctvName);

    @Query("SELECT p.cameraIp " +
            "FROM PoiCctv pc " +
            "JOIN Poi p ON pc.cctvName = p.name " +
            "WHERE pc.cctvName = :poiName")
    String findCameraIpByPoiName(String poiName);
}
