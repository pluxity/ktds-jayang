package com.pluxity.ktds.domains.user.repository;

import com.pluxity.ktds.domains.user.domain.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @Override
    @EntityGraph(attributePaths = {"userGroup", "refreshToken", "userRoles.role"})
    Optional<User> findById(Long id);

    @Override
    @EntityGraph(attributePaths = {"userGroup", "refreshToken", "userRoles.role"})
    List<User> findAll();

    @EntityGraph(attributePaths = {"userGroup", "refreshToken", "userRoles.role"})
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);
}
