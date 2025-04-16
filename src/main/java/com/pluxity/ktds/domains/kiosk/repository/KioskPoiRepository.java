package com.pluxity.ktds.domains.kiosk.repository;

import com.pluxity.ktds.domains.kiosk.entity.KioskPoi;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KioskPoiRepository extends JpaRepository<KioskPoi, Long> {

    List<KioskPoi> findAllByOrderByIdDesc();
}
