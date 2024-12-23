package com.pluxity.ktds.domains.user.controller;

import com.pluxity.ktds.domains.user.dto.UpdatePasswordDTO;
import com.pluxity.ktds.domains.user.dto.UpdateUserDTO;
import com.pluxity.ktds.domains.user.dto.UserResponseDTO;
import com.pluxity.ktds.domains.user.service.UserGroupService;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_DELETE;
import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_PATCH;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user-groups")
public class UserGroupController {

    private final UserGroupService service;


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
    public com.pluxity.ktds.global.response.ResponseBody patchUserInfo(@PathVariable("id") Long id, @RequestBody UpdateUserDTO dto) {
        service.update(id, dto);
        return com.pluxity.ktds.global.response.ResponseBody.of(SUCCESS_PATCH);
    }

    @PatchMapping(value = "/{id}/change-password")
    public com.pluxity.ktds.global.response.ResponseBody changePassword(
            @PathVariable("id") Long id, @RequestBody UpdatePasswordDTO dto) {
        service.changePassword(id, dto);
        return com.pluxity.ktds.global.response.ResponseBody.of(SUCCESS_PATCH);
    }

    @DeleteMapping(value = "/{id}")
    public com.pluxity.ktds.global.response.ResponseBody deleteUser(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }



}
