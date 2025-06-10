package com.pluxity.ktds.domains.kiosk.repository;

import com.pluxity.ktds.domains.kiosk.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByKioskPoiId(Long poiId);
}
