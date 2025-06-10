package com.pluxity.ktds.domains.building.repostiory;


import com.pluxity.ktds.domains.building.entity.Floor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FloorRepository extends JpaRepository<Floor, Long> {
   Optional<Floor> findByFloorNoAndBuildingId(Integer floorNo, Long buildingId);
}
