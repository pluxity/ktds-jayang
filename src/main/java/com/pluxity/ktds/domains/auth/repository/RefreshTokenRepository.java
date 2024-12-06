package com.pluxity.ktds.domains.auth.repository;

import com.pluxity.ktds.domains.auth.entity.RefreshToken;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;

public interface RefreshTokenRepository extends CrudRepository<RefreshToken, String> {

  Optional<RefreshToken> findByUserId(String userId);

  Optional<RefreshToken> findByToken(String token);
}
