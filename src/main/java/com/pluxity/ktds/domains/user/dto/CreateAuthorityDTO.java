package com.pluxity.ktds.domains.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateAuthorityDTO(
        @NotNull(message = "이름은 필수 입니다.")
        @NotBlank(message = "이름은 공백이 될 수 없습니다.")
        @Size(max = 20, message = "이름은 20자 이하 여야 합니다.")
        String name

) {
}
