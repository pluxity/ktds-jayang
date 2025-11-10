package com.pluxity.ktds.domains.patrol.repository;


import com.pluxity.ktds.domains.patrol.entity.Patrol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PatrolRepository extends JpaRepository<Patrol, Long> {

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);
    List<Patrol> findByBuildingId(Long buildingId);
    void deleteByBuildingId(Long buildingId);

    @Query("SELECT DISTINCT p FROM Patrol p LEFT JOIN FETCH p.patrolPoints")
    List<Patrol> findAllWithPatrolPoints();
}
