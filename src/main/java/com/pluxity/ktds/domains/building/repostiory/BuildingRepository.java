package com.pluxity.ktds.domains.building.repostiory;

import com.pluxity.ktds.domains.building.entity.Building;
import com.pluxity.ktds.domains.building.entity.Floor;
import com.pluxity.ktds.domains.building.entity.Poi;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BuildingRepository extends JpaRepository<Building, Long> {
    boolean existsByCode(String code);


    @EntityGraph(attributePaths = {"fileInfo", "lodSettings"})
    @Override
    Optional<Building> findById(@Param(value = "id") Long id);

//    @Query("""
//                SELECT b FROM Building b
//                JOIN FETCH b.poiSet
//                WHERE b.id = :buildingId
//            """)
//    List<Floor> findFloorsByBuildingId(@Param(value = "buildingId") Long buildingId);


    @Query("""
            SELECT b FROM Building b
            JOIN FETCH b.fileInfo
            JOIN FETCH b.floors f
            WHERE b.id = :id
            """)
    Optional<Building> findBuildingById(@Param("id") Long id);


    @Query("""
            SELECT p FROM Poi p
            JOIN FETCH p.floor f
            JOIN FETCH f.building b
            WHERE b.id = :id
            """)
    List<Poi> findPoisByBuildingId(@Param("id") Long id);

//    @Query("""
//            SELECT b FROM Building b
//            WHERE b.isIndoor = 'N'
//            ORDER BY b.id ASC
//            """)
//    Building findFirstByIsIndoorN(Pageable pageable);

    Optional<Building> findTop1ByIsIndoorOrderByIdDesc(String isIndoor);
    boolean existsByIsIndoor(String isIndoor);
}
