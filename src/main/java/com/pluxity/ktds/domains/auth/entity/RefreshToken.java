package com.pluxity.ktds.domains.auth.entity;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;
import org.springframework.data.redis.core.index.Indexed;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@RedisHash("refresh_token")
public class RefreshToken {

  @Id private String userId;

  @Indexed private String token;

  @TimeToLive private Long timeToLive;

  public static RefreshToken of(String userId, String token, Long timeToLive) {
    return RefreshToken.builder().userId(userId).token(token).timeToLive(timeToLive).build();
  }

  public void update(String token, Long timeToLive) {
    this.token = token;
    this.timeToLive = timeToLive;
  }
}
