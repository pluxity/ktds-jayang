package com.pluxity.ktds.domains.user.controller;

import com.pluxity.ktds.domains.user.domain.User;
import com.pluxity.ktds.domains.user.dto.UserRequestDto;
import com.pluxity.ktds.domains.user.dto.UserResponseDto;
import com.pluxity.ktds.domains.user.service.UserService;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import static com.pluxity.ktds.global.constant.SuccessCode.*;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    @GetMapping("/users")
    public DataResponseBody<List<UserResponseDto>> getUsers() {
        return DataResponseBody.of(service.findAll());
    }

    @GetMapping("/users/{id}")
    public DataResponseBody<UserResponseDto> getUser(@PathVariable Long id) {
        return DataResponseBody.of(service.findById(id));
    }

    @GetMapping("/users/auth")
    public DataResponseBody<UserResponseDto> auth() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal().equals("anonymousUser")) {
            return DataResponseBody.of(HttpStatus.BAD_REQUEST, "인증되지 않은 사용자 입니다.", null);
        }

        User principal = (User) authentication.getPrincipal();
        UserResponseDto responseDto = UserResponseDto.builder()
                .id(principal.getId())
                .username(principal.getUsername())
                .nickname(principal.getNickname())
                .roles(principal.getUserRoles().stream().map(userRole -> userRole.getRole().getName()).collect(Collectors.toSet()))
                .build();


        return DataResponseBody.of(responseDto);
    }

    @PostMapping("/login")
    public ResponseBody authenticate(@RequestBody UserRequestDto dto,
                                     HttpServletRequest request,
                                     HttpServletResponse response) {
        service.login(dto, request, response);
        return ResponseBody.of(SUCCESS);
    }

    @PostMapping("/logout")
    public ResponseBody logout(HttpServletRequest request,
                               HttpServletResponse response) {
        service.logout(request, response);
        return ResponseBody.of(SUCCESS);
    }


    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseBody postUser(@RequestBody UserRequestDto dto) {
        service.save(dto);
        return ResponseBody.of(SUCCESS_CREATE);
    }

    @PatchMapping("/users/{id}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchUser(@PathVariable Long id,
                                  @RequestBody UserRequestDto dto) {
        service.update(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody deleteUser(@PathVariable Long id) {
        service.delete(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }

}
