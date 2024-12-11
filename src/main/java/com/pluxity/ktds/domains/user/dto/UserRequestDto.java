package com.pluxity.ktds.domains.user.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.util.Set;

@Builder
public record UserRequestDto(
        Long userGroupId,
        @NotNull(message = "아이디는 필수 입니다.")
        @NotBlank(message = "아이디는 공백이 될 수 없습니다.")
        String username,
        @NotNull(message = "비밀번호는 필수 입니다.")
        @NotBlank(message = "비밀번호는 공백이 될 수 없습니다.")
        @Size(min = 8, max = 100, message = "비밀번호는 8자 이상 20자 이하 입니다.")

        String password,
        @NotNull(message = "이름은 필수 입니다.")
        @NotBlank(message = "이름은 공백이 될 수 없습니다.")
        String nickname,
        @NotNull(message = "권한은 필수 입니다.")
        Set<Long> roleIds
) {
}
