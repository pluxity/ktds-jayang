package com.pluxity.ktds.domains.user.repository;

import com.pluxity.ktds.domains.user.entity.KioskUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface KioskUserRepository extends JpaRepository<KioskUser, Long> {
    Optional<KioskUser> findByName(String name);
    boolean existsByName(String name);

}
