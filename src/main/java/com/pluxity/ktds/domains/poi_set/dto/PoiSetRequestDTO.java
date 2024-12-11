package com.pluxity.ktds.domains.poi_set.dto;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.util.List;

@Builder
public record PoiSetRequestDTO(
        @NotNull(message = "이름은 필수 입니다.")
        @NotBlank(message = "이름은 공백이 될 수 없습니다.")
        @Size(max = 20, message = "사이즈는 20이 최대입니다")
        String name,
        @Nullable
        List<Long> poiCategoryIds
) {
}
