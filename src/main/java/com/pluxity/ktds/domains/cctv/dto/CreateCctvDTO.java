package com.pluxity.ktds.domains.cctv.dto;

import com.pluxity.ktds.domains.cctv.entity.Cctv;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Valid
public record CreateCctvDTO(
        @NotNull(message = "Name 은 필수 입니다.")
        @NotBlank(message = "Name 은 공백이 될 수 없습니다.")
        String name,
        @NotNull(message = "Code 는 필수 입니다.")
        @NotBlank(message = "Code 는 공백이 될 수 없습니다.")
        String code,
        @NotNull(message = "URL 은 필수 입니다.")
        @NotBlank(message = "URL 은 공백이 될 수 없습니다.")
        String url,
        String description
) {

    public static Cctv toEntity(CreateCctvDTO dto) {
        return Cctv.builder()
                .name(dto.name())
                .code(dto.code())
                .url(dto.url())
                .description(dto.description())
                .build();
    }

}
