package com.pluxity.ktds.domains.vms_event.repository;

import com.pluxity.ktds.domains.vms_event.entity.VmsEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VmsEventRepository extends JpaRepository<VmsEvent, Long> {
}
