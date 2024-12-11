package com.pluxity.ktds.security.service;

import com.pluxity.ktds.domains.user.domain.User;
import com.pluxity.ktds.domains.user.domain.UserRole;
import com.pluxity.ktds.domains.user.repository.UserRepository;
import com.pluxity.ktds.security.domain.RefreshToken;
import com.pluxity.ktds.security.repository.RefreshTokenRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserDetailsService userDetailsService;
    @Value("${jwt.access-token.expiration}")
    public int ACCESS_TOKEN_EXPIRE_AT;
    @Value("${jwt.refresh-token.expiration}")
    public int REFRESH_TOKEN_EXPIRE_AT;
    @Value("${jwt.access-token.secret-key}")
    private String accessTokenSecretKey;
    @Value("${jwt.refresh-token.secret-key}")
    private String refreshTokenSecretKey;

    public String generateAccessToken(
            UserDetails userDetails
    ) {

        Map<String, Object> extraClaims = new HashMap<>();
        userRepository.findByUsername(userDetails.getUsername()).ifPresent(user -> {
            extraClaims.put("id", user.getId());
            extraClaims.put("username", user.getUsername());
            extraClaims.put("nickname", user.getNickname());
//            extraClaims.put("userGroupId", user.getUserGroup().getId());
            extraClaims.put("userRole", user.getUserRoles());
            extraClaims.put("role", user.getUserRoles().stream()
                    .map(UserRole::getRole)
                    .collect(Collectors.toSet()));
        });

        return Jwts
                .builder()
//                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRE_AT))
                .signWith(getAccessTokenSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String generateRefreshToken(UserDetails userDetails) {
        String tokenId = UUID.randomUUID().toString();

        String refreshTokenString = Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRE_AT))
                .signWith(getAccessTokenSigningKey(), SignatureAlgorithm.HS512)
                .compact();

        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow(
                () -> new IllegalStateException("유저가 존재하지 않습니다." + userDetails.getUsername())
        );
        if (user.getRefreshToken() != null) {
            refreshTokenRepository.delete(user.getRefreshToken());
        }
        RefreshToken refreshToken = RefreshToken.builder()
                .tokenId(tokenId)
                .refreshToken(refreshTokenString)
                .user(user)
                .build();
        user.updateRefreshToken(refreshToken);
        refreshTokenRepository.save(refreshToken);

        return refreshTokenString;
    }


    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getAccessTokenSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isAccessTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && isTokenNotExpired(token);
    }

    public boolean isRefreshTokenValid(String refreshToken) {
        if (refreshTokenRepository.existsByRefreshToken(refreshToken)) {
            String username = extractUsername(refreshToken);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            return isAccessTokenValid(refreshToken, userDetails);
        }

        return false;
    }

    public String getTokenId(String token) {
        return String.valueOf(extractClaim(token, Claims::getId));
    }


    private SecretKey getAccessTokenSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(accessTokenSecretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private SecretKey getRefreshTokenSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(refreshTokenSecretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }


    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private boolean isTokenNotExpired(String token) {
        return !isTokenExpired(token);
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }


    public boolean isRefreshTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && isTokenNotExpired(token);
    }


    //    revoked token 활용 예시
}
