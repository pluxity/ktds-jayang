package com.pluxity.ktds.domains.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record KioskSignInRequestDTO(
        @NotNull(message = "비밀번호는 필수 입니다.")
        @NotBlank(message = "비밀번호는 공백이 될 수 없습니다.")
        @Size(min = 6, max = 20, message = "비밀번호는 6자 이상 20자 이하 여야 합니다.")
        String password
) {}
