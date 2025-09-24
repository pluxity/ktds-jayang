package com.pluxity.ktds.domains.management.repository;

import com.pluxity.ktds.domains.management.entity.Maintenance;
import com.pluxity.ktds.global.repository.BaseRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaintenanceRepository extends BaseRepository<Maintenance, Long> {
}
