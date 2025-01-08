package com.pluxity.ktds.domains.patrol.repository;


import com.pluxity.ktds.domains.patrol.entity.PatrolPoint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PatrolPointRepository extends JpaRepository<PatrolPoint, Long> {
    List<PatrolPoint> findByPatrolId(Long patrolId);
}
