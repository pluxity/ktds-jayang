package com.pluxity.ktds.domains.user.repository;

import com.pluxity.ktds.domains.user.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByUsername(String username);

    @EntityGraph(attributePaths = {"userGroup"})
    Optional<User> findByUsername(String username);
    List<User> findByUserGroupId(Long id);
}
