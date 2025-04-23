package com.pluxity.ktds.domains.user.service;

import com.pluxity.ktds.domains.user.dto.KioskSignInRequestDTO;
import com.pluxity.ktds.domains.user.dto.KioskSignInResponseDTO;
import com.pluxity.ktds.domains.user.dto.UpdatePasswordDTO;
import com.pluxity.ktds.domains.user.entity.KioskUser;
import com.pluxity.ktds.domains.user.repository.KioskUserRepository;
import com.pluxity.ktds.global.exception.CustomException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.pluxity.ktds.global.constant.ErrorCode.INVALID_PASSWORD;
import static com.pluxity.ktds.global.constant.ErrorCode.NOT_FOUND_USER;

@Service
@RequiredArgsConstructor
public class KioskUserService {

    private final KioskUserRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void changePassword(Long id, UpdatePasswordDTO dto) {
        KioskUser user = repository.findById(id).orElseThrow(() -> new CustomException(NOT_FOUND_USER));
        if(passwordEncoder.matches(dto.password(),user.getPassword())){
            user.changePassword(passwordEncoder.encode(dto.newPassword()));
        }else{
            throw new CustomException(INVALID_PASSWORD);
        }
    }

    @Transactional(readOnly = true)
    public Long findByName(String name){
        KioskUser user = repository.findByName(name).orElseThrow(() -> new CustomException(NOT_FOUND_USER));
        return  user.getId();
    }

    @Transactional(readOnly = true)
    public KioskSignInResponseDTO kioskSignIn(final KioskSignInRequestDTO dto, HttpServletResponse response){
        KioskUser user = repository.findByName("Kiosk").orElseThrow(() -> new CustomException(NOT_FOUND_USER));

        if(passwordEncoder.matches(dto.password(),user.getPassword())){
            Cookie cookie = new Cookie("USER_ID", user.getName());
            cookie.setMaxAge(60 * 60 * 24);
            cookie.setPath("/");
            response.addCookie(cookie);

            return KioskSignInResponseDTO.builder()
                    .name(user.getName())
                    .build();
        }else{
            throw new CustomException(INVALID_PASSWORD);

        }
    }
}
