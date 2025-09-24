package com.pluxity.ktds.domains.user.dto;

import com.pluxity.ktds.domains.user.entity.User;
import com.pluxity.ktds.domains.user.entity.UserAuthority;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.util.Set;

@Valid
@Builder
public record CreateUserGroupDTO(
        @NotNull(message = "그룹명은 필수 입니다.")
        @NotBlank(message = "그룹명은 공백이 될 수 없습니다.")
        @Size(max = 20, message = "그룹명은 20자 이하 여야 합니다.")
        String name,
        String groupType,
        String description
) {
}
