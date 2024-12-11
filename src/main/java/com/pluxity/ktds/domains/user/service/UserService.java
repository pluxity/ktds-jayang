package com.pluxity.ktds.domains.user.service;

import com.pluxity.ktds.domains.user.domain.Role;
import com.pluxity.ktds.domains.user.domain.User;
import com.pluxity.ktds.domains.user.domain.UserRole;
import com.pluxity.ktds.domains.user.dto.UserRequestDto;
import com.pluxity.ktds.domains.user.dto.UserResponseDto;
import com.pluxity.ktds.domains.user.repository.RoleRepository;
import com.pluxity.ktds.domains.user.repository.UserRepository;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import com.pluxity.ktds.security.domain.RefreshToken;
import com.pluxity.ktds.security.repository.RefreshTokenRepository;
import com.pluxity.ktds.security.service.JwtService;
import io.micrometer.common.util.StringUtils;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.WebUtils;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class UserService {

    public static final String ACCESS_TOKEN = "AccessToken";
    public static final String REFRESH_TOKEN = "RefreshToken";
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.access-token.expiration}")
    public int ACCESS_TOKEN_EXPIRE_AT;
    @Value("${jwt.refresh-token.expiration}")
    public int REFRESH_TOKEN_EXPIRE_AT;


    @Transactional(readOnly = true)
    public List<UserResponseDto> findAll() {
        return userRepository.findAll().stream()
                .map(this::convertToUserResponseDto)
                .toList();
    }


    @Transactional(readOnly = true)
    public UserResponseDto findById(@NotNull final Long id) {
        return userRepository.findById(id)
                .map(this::convertToUserResponseDto)
                .orElseThrow(notFoundUserException());
    }


    @Transactional
    public UserResponseDto save(@NotNull @Valid final UserRequestDto dto) {
        validationUserRequestDto(dto);
        checkUserExistence(dto);

        User user = User.builder()
                .username(dto.username())
                .password(passwordEncoder.encode(dto.password()))
                .nickname(dto.nickname())
                .build();


        dto.roleIds().stream()
                .map(roleRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .forEach(role -> user.addUserRole(UserRole.builder()
                        .user(user)
                        .role(role)
                        .build()));

        userRepository.save(user);
        return convertToUserResponseDto(user);
    }


    @Transactional()
    public void update(@NotNull final Long id,
                       @NotNull @Valid final UserRequestDto dto) {
        checkIdNotNull(id);

        User user = userRepository.findById(id)
                .orElseThrow(notFoundUserException());


        user.update(dto);


        if (dto.roleIds() != null) {
            List<Role> roles = roleRepository.findAllById(dto.roleIds());
            user.clearRole();
            for (Role role : roles) {
                UserRole userRole = UserRole.builder()
                        .user(user)
                        .role(role)
                        .build();
                user.addUserRole(userRole);
            }
        }
    }


    @Transactional(readOnly = true)
    public UserResponseDto login(@NotNull @Valid final UserRequestDto dto,
                                 @NotNull final HttpServletRequest request,
                                 @NotNull final HttpServletResponse response) {
        User user = userRepository.findByUsername(dto.username())
                .orElseThrow(notFoundUserException());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            dto.username(),
                            dto.password()
                    )
            );
        } catch (Exception e) {
            log.error(e.getStackTrace());
            throw new CustomException(ErrorCode.INVALID_ID_OR_PASSWORD);
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        createCookie(accessToken, refreshToken, request, response);

        return convertToUserResponseDto(user);
    }


    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {

        String refreshToken = Arrays.stream(request.getCookies())
                .filter(cookie -> REFRESH_TOKEN.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);


        if (refreshTokenRepository.existsByRefreshToken(refreshToken)) {
            RefreshToken fetchRefreshToken = refreshTokenRepository.findByRefreshToken(refreshToken).orElseThrow(
                    () -> new CustomException(ErrorCode.NOT_FOUND_TOKEN));
            fetchRefreshToken.delete();
            refreshTokenRepository.delete(fetchRefreshToken);
        }


        Cookie accessTokenCookie = new Cookie(ACCESS_TOKEN, null);
        accessTokenCookie.setMaxAge(0);
        accessTokenCookie.setPath("/");
        response.addCookie(accessTokenCookie);

        Cookie refreshTokenCookie = new Cookie(REFRESH_TOKEN, null);
        refreshTokenCookie.setMaxAge(0);
        refreshTokenCookie.setPath("/");
        response.addCookie(refreshTokenCookie);

        response.setStatus(HttpServletResponse.SC_OK);
    }


    @Transactional
    public void delete(@NotNull final Long id) {
        checkIdNotNull(id);
        User user = userRepository.findById(id).orElseThrow(notFoundUserException());
        userRepository.delete(user);
    }

    private Supplier<CustomException> notFoundUserException() {
        return () -> new CustomException(ErrorCode.NOT_FOUND_USER);
    }

    private UserResponseDto convertToUserResponseDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .nickname(user.getNickname())
                .roles(user.getUserRoles().stream()
                        .map(UserRole::getRole)
                        .filter(Objects::nonNull)
                        .map(Role::getName)
                        .collect(Collectors.toSet()))
                .build();
    }

    private void checkUserExistence(UserRequestDto request) {
        userRepository.findByUsername(request.username())
                .ifPresent(user -> {
                    throw new CustomException(ErrorCode.DUPLICATE_USERID, request.username());
                });
    }

    private void validationUserRequestDto(UserRequestDto dto) {
        if (StringUtils.isBlank(dto.username())) {
            throw new CustomException(ErrorCode.EMPTY_VALUE_USERNAME);
        }
        if (StringUtils.isBlank(dto.password())) {
            throw new CustomException(ErrorCode.EMPTY_VALUE_PASSWORD);
        }
        if (StringUtils.isBlank(dto.nickname())) {
            throw new CustomException(ErrorCode.EMPTY_VALUE_NICKNAME);
        }
    }

    private void checkIdNotNull(Long id) {
        Objects.requireNonNull(id, "아이디를 입력해주세요.");
    }

    private void createCookie(String accessToken,
                              String refreshToken,
                              HttpServletRequest request,
                              HttpServletResponse response) {

        Cookie refreshCookie = WebUtils.getCookie(request, REFRESH_TOKEN);
        if (refreshCookie == null) {
            Cookie cookie = new Cookie(REFRESH_TOKEN, refreshToken);
            cookie.setMaxAge(REFRESH_TOKEN_EXPIRE_AT / 1000);
            cookie.setHttpOnly(true);
            cookie.setSecure(true);
            cookie.setDomain("localhost");
            cookie.setPath("/");
            response.addCookie(cookie);
        }

        Cookie accessCookie = WebUtils.getCookie(request, ACCESS_TOKEN);
        if (accessCookie == null) {
            Cookie cookie = new Cookie(ACCESS_TOKEN, accessToken);
            cookie.setMaxAge(ACCESS_TOKEN_EXPIRE_AT / 1000);
            cookie.setHttpOnly(true);
            cookie.setSecure(true);
            cookie.setDomain("localhost");
            cookie.setPath("/");
            response.addCookie(cookie);
        }
    }

}
