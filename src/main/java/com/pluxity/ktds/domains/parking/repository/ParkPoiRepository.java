package com.pluxity.ktds.domains.parking.repository;

import com.pluxity.ktds.domains.building.entity.Building;
import com.pluxity.ktds.domains.parking.entity.ParkPoi;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParkPoiRepository extends JpaRepository<ParkPoi, Long> {

    List<ParkPoi> findAllByBuilding(Building building);
}
