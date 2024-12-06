package com.pluxity.ktds.domains.user.repository;

import com.pluxity.ktds.domains.user.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByUserId(String userid);
}
