package com.pluxity.ktds.domains.management.repository;

import com.pluxity.ktds.domains.management.entity.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
}
