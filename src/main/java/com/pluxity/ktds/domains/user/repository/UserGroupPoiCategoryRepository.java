package com.pluxity.ktds.domains.user.repository;

import com.pluxity.ktds.domains.user.entity.UserGroupPoiCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserGroupPoiCategoryRepository extends JpaRepository<UserGroupPoiCategory, Long> {
    void deleteByPoiCategoryId(Long categoryId);
}
