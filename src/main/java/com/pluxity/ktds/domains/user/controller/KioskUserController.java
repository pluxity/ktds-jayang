package com.pluxity.ktds.domains.user.controller;

import com.pluxity.ktds.domains.user.dto.KioskSignInRequestDTO;
import com.pluxity.ktds.domains.user.dto.KioskSignInResponseDTO;
import com.pluxity.ktds.domains.user.dto.UpdatePasswordDTO;
import com.pluxity.ktds.domains.user.service.KioskUserService;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_PATCH;

@RestController
@RequiredArgsConstructor
@RequestMapping("/kiosk-user")
public class KioskUserController {

    private final KioskUserService kioskUserService;

    @PostMapping(value = "/sign-in")
    public DataResponseBody<KioskSignInResponseDTO> signIn(
            @RequestBody KioskSignInRequestDTO signInRequestDto, HttpServletResponse response) {
        return DataResponseBody.of(kioskUserService.kioskSignIn(signInRequestDto, response));
    }

    @GetMapping("/userid/{name}")
    public DataResponseBody<Long> getUser(@PathVariable String name) {
        return DataResponseBody.of(kioskUserService.findByName(name));
    }

    @PatchMapping(value = "/{id}/change-password")
    public ResponseBody changePassword(
            @PathVariable("id") Long id, @RequestBody UpdatePasswordDTO dto) {
        System.out.println("id = "+ id + "dto = " + dto.password()+" "+dto.newPassword());
        kioskUserService.changePassword(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }
}
