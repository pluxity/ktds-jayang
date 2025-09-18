package com.pluxity.ktds.domains.user.controller;

import com.pluxity.ktds.domains.user.dto.*;
import com.pluxity.ktds.domains.user.service.UserGroupService;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

import static com.pluxity.ktds.global.constant.SuccessCode.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user-groups")
public class UserGroupController {

    private final UserGroupService service;

    @GetMapping()
    public DataResponseBody<List<UserGroupResponseDTO>> getUserGroups() {
        return DataResponseBody.of(service.findAll());
    }

    @GetMapping("/{id}")
    public DataResponseBody<UserGroupResponseDTO> getUserGroup(@PathVariable Long id) {
        return DataResponseBody.of(service.findById(id));
    }

    @PostMapping()
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseBody postUserGroup(@RequestBody CreateUserGroupDTO dto) {
        service.save(dto);
        return ResponseBody.of(SUCCESS_CREATE);
    }

    @PatchMapping("/{id}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchUserGroup(@PathVariable Long id,
                                       @RequestBody CreateUserGroupDTO dto) {
        service.update(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody deleteUserGroup(@PathVariable Long id) {
        service.delete(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }

    @PatchMapping("/{id}/permissions")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchUserGroupPermissions(@PathVariable Long id,
                                                  @RequestBody UpdateUserGroupPermissionDTO dto) {
        service.updatePermissions(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }
}
