package com.pluxity.ktds.global.security;

import static com.pluxity.ktds.global.constant.ErrorCode.*;

import com.pluxity.ktds.domains.auth.entity.RefreshToken;
import com.pluxity.ktds.domains.auth.repository.RefreshTokenRepository;
import com.pluxity.ktds.global.exception.CustomException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@Slf4j
public class JwtProvider {

  private static final String BEARER_TYPE = "Bearer ";

  @Value("${jwt.access-token.secret}")
  private String accessSecretKey;

  @Value("${jwt.access-token.expiration}")
  private long accessExpiration;

  @Value("${jwt.refresh-token.secret}")
  private String refreshSecretKey;

  @Value("${jwt.refresh-token.expiration}")
  private long refreshExpiration;

  private final RefreshTokenRepository refreshTokenRepository;

  public JwtProvider(RefreshTokenRepository refreshTokenRepository) {
    this.refreshTokenRepository = refreshTokenRepository;
  }

  @PostConstruct
  protected void init() {
    accessSecretKey = Base64.getEncoder().encodeToString(accessSecretKey.getBytes());
    refreshSecretKey = Base64.getEncoder().encodeToString(refreshSecretKey.getBytes());
  }

  public String extractUsername(String token) {
    return extractUsername(token, false);
  }

  public String extractUsername(String token, boolean isRefreshToken) {
    return extractClaim(token, Claims::getSubject, isRefreshToken);
  }

  public <T> T extractClaim(
      String token, Function<Claims, T> claimsResolver, final boolean isRefreshToken) {
    final Claims claims = extractAllClaims(token, isRefreshToken);
    return claimsResolver.apply(claims);
  }

  private Claims extractAllClaims(String token, final boolean isRefreshToken) {
    return Jwts.parserBuilder()
        .setSigningKey(getSignInKey(isRefreshToken))
        .build()
        .parseClaimsJws(token)
        .getBody();
  }

  public String generateAccessToken(UserDetails userDetails) {
    return generateAccessToken(new HashMap<>(), userDetails);
  }

  public String generateAccessToken(Map<String, Object> extraClaims, UserDetails userDetails) {
    return buildToken(extraClaims, userDetails, accessExpiration, false);
  }

  public String generateRefreshToken(UserDetails userDetails) {
    return buildToken(new HashMap<>(), userDetails, refreshExpiration, true);
  }

  private String buildToken(
      Map<String, Object> extraClaims,
      UserDetails userDetails,
      long expiration,
      final boolean isRefreshToken) {
    return Jwts.builder()
        .setClaims(extraClaims)
        .setSubject(userDetails.getUsername())
        .setIssuedAt(new Date(System.currentTimeMillis()))
        .setExpiration(new Date(System.currentTimeMillis() + expiration))
        .signWith(getSignInKey(isRefreshToken), SignatureAlgorithm.HS256)
        .compact();
  }

  public boolean isAccessTokenValid(String token) {
    try {
      Jwts.parserBuilder().setSigningKey(getSignInKey(false)).build().parseClaimsJws(token);

      return true;
    } catch (ExpiredJwtException e) {
      throw new CustomException(EXPIRED_ACCESS_TOKEN);
    } catch (JwtException | IllegalArgumentException e) {
      throw new CustomException(INVALID_ACCESS_TOKEN);
    }
  }

  public boolean isRefreshTokenValid(String token) {
    try {

      RefreshToken refreshToken =
          refreshTokenRepository
              .findByToken(token)
              .orElseThrow(() -> new CustomException(INVALID_REFRESH_TOKEN));

      Jwts.parserBuilder()
          .setSigningKey(getSignInKey(true))
          .build()
          .parseClaimsJws(refreshToken.getToken());

      return true;
    } catch (ExpiredJwtException e) {
      throw new CustomException(EXPIRED_REFRESH_TOKEN);
    } catch (JwtException | IllegalArgumentException e) {
      System.out.println("RefreshToken :" + e.getMessage());
      throw new CustomException(INVALID_REFRESH_TOKEN);
    }
  }

  private Key getSignInKey(final boolean isRefreshToken) {
    byte[] keyBytes = Decoders.BASE64.decode(isRefreshToken ? refreshSecretKey : accessSecretKey);
    return Keys.hmacShaKeyFor(keyBytes);
  }

  public String getJwtFromRequest(HttpServletRequest request) {
    String bearerToken = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_TYPE)) {
      return bearerToken.substring(7);
    }
    throw new CustomException(INVALID_TOKEN_FORMAT);
  }
}
