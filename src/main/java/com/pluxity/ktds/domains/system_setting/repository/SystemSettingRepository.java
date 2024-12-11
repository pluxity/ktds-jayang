package com.pluxity.ktds.domains.system_setting.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.pluxity.ktds.domains.system_setting.entity.SystemSetting;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {

}
