package com.pluxity.ktds.domains.user.repository;

import com.pluxity.ktds.domains.user.entity.UserGroupBuilding;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserGroupBuildingRepository extends JpaRepository<UserGroupBuilding, Long> {
    void deleteByBuildingId(Long buildingId);
}
