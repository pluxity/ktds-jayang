package com.pluxity.ktds.domains.user.repository;

import com.pluxity.ktds.domains.user.entity.UserAuthority;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAuthorityRepository extends JpaRepository<UserAuthority, Long> {
}
