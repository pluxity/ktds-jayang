package com.pluxity.ktds.domains.user.controller;

import com.pluxity.ktds.domains.user.dto.CreateUserDTO;
import com.pluxity.ktds.domains.user.dto.UpdatePasswordDTO;
import com.pluxity.ktds.domains.user.dto.UpdateUserDTO;
import com.pluxity.ktds.domains.user.dto.UserResponseDTO;
import com.pluxity.ktds.domains.user.service.UserService;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import static com.pluxity.ktds.global.constant.SuccessCode.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

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
            Principal principal
    ) {
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
