package com.pluxity.ktds.domains.cctv.repository;

import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.cctv.dto.PoiCctvResponseDTO;
import com.pluxity.ktds.domains.cctv.entity.PoiCctv;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PoiCctvRepository extends JpaRepository<PoiCctv, Long> {
    List<PoiCctv> findAllByPoi(Poi poi);
    List<PoiCctv> findAllByPoiIn(List<Poi> poiList);

    @Query("SELECT new com.pluxity.ktds.domains.cctv.dto.PoiCctvResponseDTO(p.id, p1.id) " +
           "FROM PoiCctv poiCctv " +
           "JOIN Poi p ON poiCctv.cctvName = p.name " +
           "JOIN Poi p1 ON poiCctv.poi = p1")
    List<PoiCctvResponseDTO> findByCctvNameWithPoiDto();
}
