package com.pluxity.ktds.domains.user.repository;

import com.pluxity.ktds.domains.user.entity.User;
import com.pluxity.ktds.domains.user.entity.UserAuthority;
import com.pluxity.ktds.domains.user.entity.UserGroup;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserAuthorityRepository extends JpaRepository<UserAuthority, Long> {
    List<UserAuthority> findByUserGroup(UserGroup userGroup);
    @EntityGraph(attributePaths = {"userGroup"})
    Optional<UserAuthority> findByName(String name);
}
