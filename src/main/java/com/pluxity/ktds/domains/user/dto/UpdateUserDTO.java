package com.pluxity.ktds.domains.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateUserDTO(
    @NotNull(message = "이름은 필수 입니다.") @NotBlank(message = "이름은 공백이 될 수 없습니다.") String name
) {}
