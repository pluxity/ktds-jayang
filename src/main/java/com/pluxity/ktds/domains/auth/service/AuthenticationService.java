package com.pluxity.ktds.domains.auth.service;

import com.pluxity.ktds.domains.auth.dto.SignInRequestDTO;
import com.pluxity.ktds.domains.auth.dto.SignInResponseDTO;
import com.pluxity.ktds.domains.auth.dto.SignUpDTO;
import com.pluxity.ktds.domains.user.dto.CreateUserDTO;
import com.pluxity.ktds.domains.user.entity.User;
import com.pluxity.ktds.domains.user.service.UserService;
import com.pluxity.ktds.global.exception.CustomException;
import com.pluxity.ktds.global.security.CustomUserDetails;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

import static com.pluxity.ktds.global.constant.ErrorCode.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

  private final UserService userService;

  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;

  @Transactional
  public void signUp(final SignUpDTO signUpRequestDto) {
    boolean isExist = userService.isUserExists(signUpRequestDto.username());
    if(isExist) {
      throw new CustomException(DUPLICATE_NAME);
    }

    CreateUserDTO createUserDTO = CreateUserDTO.builder()
            .username(signUpRequestDto.username())
            .password(passwordEncoder.encode(signUpRequestDto.password()))
            .name(signUpRequestDto.name())
            .build();

    userService.save(createUserDTO);
  }

  @Transactional
  public SignInResponseDTO signIn(final SignInRequestDTO signInRequestDto, HttpServletRequest request, HttpServletResponse response) {

    try {
      Authentication authentication = authenticationManager.authenticate(
              new UsernamePasswordAuthenticationToken(signInRequestDto.username(), signInRequestDto.password())
      );

      SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
      securityContext.setAuthentication(authentication);
      SecurityContextHolder.setContext(securityContext);

//      SecurityContextRepository contextRepository = new HttpSessionSecurityContextRepository();
//      contextRepository.saveContext(securityContext, request, response);

      HttpSession session = request.getSession(true);
      session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);

      CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
      User user = userService.findUserByUsername(userDetails.getUsername());

      Cookie cookie = new Cookie("USER_ID", userDetails.getUsername());
      Cookie cookieRole = new Cookie("USER_ROLE", userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.joining(",")));
      cookieRole.setMaxAge(60 * 60 * 24);
      cookieRole.setPath("/");
      //      cookie.setHttpOnly(true);
      cookie.setMaxAge(60 * 60 * 24);
      cookie.setPath("/");
      response.addCookie(cookie);
      response.addCookie(cookieRole);

      return SignInResponseDTO.builder()
              .username(user.getUsername())
              .name(user.getName())
              .build();

    } catch (AuthenticationException e) {
      log.error("Invalid Username or Password : {}", e.getMessage());
      throw new CustomException(INVALID_ID_OR_PASSWORD);
    }
  }
}
