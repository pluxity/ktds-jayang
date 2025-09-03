package com.pluxity.ktds.domains.system_setting.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.pluxity.ktds.domains.system_setting.entity.SystemSetting;

import java.util.Optional;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {

    Optional<SystemSetting> findByBuildingId(Long buildingId);
}
