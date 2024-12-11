package com.pluxity.ktds.domains.user.repository;

import com.pluxity.ktds.domains.user.domain.UserRole;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    @EntityGraph(attributePaths = {"user.userGroup", "user.refreshToken", "role"})
    @Override
    Optional<UserRole> findById(Long id);
}
