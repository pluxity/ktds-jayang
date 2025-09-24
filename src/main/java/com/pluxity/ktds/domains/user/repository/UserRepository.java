package com.pluxity.ktds.domains.user.repository;

import com.pluxity.ktds.domains.user.entity.User;
import com.pluxity.ktds.global.repository.BaseRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends BaseRepository<User, Long> {

    boolean existsByUsername(String username);

    @EntityGraph(attributePaths = {
            "userGroup",
            "userGroup.authorities",
            "userGroup.buildingPermissions",
            "userGroup.categoryPermissions",
            "userGroup.menuPermissions"
    })
    Optional<User> findByUsername(String username);
    List<User> findByUserGroupId(Long id);
}
