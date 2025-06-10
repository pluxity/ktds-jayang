package com.pluxity.ktds.domains.cctv.repository;

import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.cctv.entity.Cctv;
import com.pluxity.ktds.domains.cctv.entity.PoiCctv;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PoiCctvRepository extends JpaRepository<PoiCctv, Long> {
    List<PoiCctv> findAllByPoi(Poi poi);
}
