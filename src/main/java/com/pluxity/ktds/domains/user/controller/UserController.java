package com.pluxity.ktds.domains.user.controller;

import com.pluxity.ktds.domains.user.dto.CreateUserDTO;
import com.pluxity.ktds.domains.user.dto.UpdatePasswordDTO;
import com.pluxity.ktds.domains.user.dto.UpdateUserDTO;
import com.pluxity.ktds.domains.user.dto.UserResponseDTO;
import com.pluxity.ktds.domains.user.service.UserService;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.Principal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.pluxity.ktds.global.constant.SuccessCode.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;
    private final UserDetailsService userDetailsService;

    @GetMapping
    public DataResponseBody<List<UserResponseDTO>> getUsers() {
        return DataResponseBody.of(service.findAll());
    }

    @GetMapping(value = "/{id}")
    public DataResponseBody<UserResponseDTO> getUser(@PathVariable("id") Long id) {
        return DataResponseBody.of(service.findById(id));
    }

    @GetMapping(value = "/me")
    public DataResponseBody<UserResponseDTO> getMe(
            Principal principal,
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        if (principal == null) {
            String userId = Arrays.stream(Optional.ofNullable(request.getCookies()).orElse(new Cookie[0]))
                    .filter(c -> "USER_ID".equals(c.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);

            if (userId != null) {
                try {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(userId);

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    principal = authentication;
                } catch (Exception e) {
                    new SecurityContextLogoutHandler().logout(request, response, null);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\":\"SESSION_EXPIRED\"}");
                    return null;
                }
            } else {
                new SecurityContextLogoutHandler().logout(request, response, null);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"message\":\"SESSION_EXPIRED\"}");
                return null;
            }
        }
        return DataResponseBody.of(service.findMe(principal));
    }

    @PatchMapping(value = "/{id}")
    public ResponseBody patchUserInfo(@PathVariable("id") Long id, @RequestBody UpdateUserDTO dto) {
        service.update(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @PatchMapping(value = "/{id}/change-password")
    public ResponseBody changePassword(
            @PathVariable("id") Long id, @RequestBody UpdatePasswordDTO dto) {
        service.changePassword(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseBody deleteUser(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }

    @GetMapping("/userid/{userid}")
    public DataResponseBody<UserResponseDTO> getUser(@PathVariable String userid) {
        return DataResponseBody.of(service.findByUserid(userid));
    }

    @PostMapping
    public ResponseBody postUser(@RequestBody Map<String, Object> request) {
        CreateUserDTO dto = CreateUserDTO.builder()
                .name(request.get("name").toString())
                .username(request.get("username").toString())
                .password(request.get("password").toString())
                .build();

        service.save(dto, request);
        return ResponseBody.of(SUCCESS_CREATE);
    }
}
