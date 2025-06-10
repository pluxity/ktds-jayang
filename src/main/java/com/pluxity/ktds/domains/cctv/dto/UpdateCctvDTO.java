package com.pluxity.ktds.domains.cctv.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Valid
public record UpdateCctvDTO(
        @NotNull(message = "Name 은 필수 입니다.")
        @NotBlank(message = "Name 은 공백이 될 수 없습니다.")
        String name,
        @NotNull(message = "Code 는 필수 입니다.")
        @NotBlank(message = "Code 는 공백이 될 수 없습니다.")
        String code,
        @NotNull(message = "URL 은 필수 입니다.")
        @NotBlank(message = "URL 은 공백이 될 수 없습니다.")
        String url,
        String description) {
}
