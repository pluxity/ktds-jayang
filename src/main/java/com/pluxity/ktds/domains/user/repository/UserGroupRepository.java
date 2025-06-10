package com.pluxity.ktds.domains.user.repository;

import com.pluxity.ktds.domains.user.entity.UserGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserGroupRepository extends JpaRepository<UserGroup, Long> {
    Optional<UserGroup> findByName(String name);
}
