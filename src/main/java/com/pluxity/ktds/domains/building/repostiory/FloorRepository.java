package com.pluxity.ktds.domains.building.repostiory;


import com.pluxity.ktds.domains.building.dto.FloorInfo;
import com.pluxity.ktds.domains.building.entity.Floor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FloorRepository extends JpaRepository<Floor, Long> {
   Optional<Floor> findByFloorNoAndBuildingId(Integer floorNo, Long buildingId);

   @Query("""
    SELECT new com.pluxity.ktds.domains.building.dto.FloorInfo(
        CAST(f.id AS string),
        sf.sbmFileName,
        sf.sbmFloorBase
    )
    FROM Floor f
    JOIN FloorHistory fh ON f.id = fh.floor.id
    JOIN SbmFloor sf ON f.id = sf.floor.id
    WHERE f.building.id = :buildingId
    AND f.floorNo = (
        SELECT f2.floorNo
        FROM Floor f2
        WHERE f2.id = :currentFloorId
    )
    AND fh.buildingFileHistory.id = :historyId
    """)
   List<FloorInfo> findFloorInfoForNewVersion(
           @Param("buildingId") Long buildingId,
           @Param("currentFloorId") Long currentFloorId,
           @Param("historyId") Long historyId
   );
}
