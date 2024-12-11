package com.pluxity.ktds.domains.building.dto;

import com.pluxity.ktds.domains.building.entity.LodSettings;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record UpdateBuildingDTO(
        @NotNull(message = "코드는 필수 입니다.")
        @NotBlank(message = "코드는 공백이 될 수 없습니다.")
        @Size(min = 1, max = 20, message = "코드는 20자 이하 입니다.")
        String code,
        @NotNull(message = "이름은 필수 입니다.")
        @NotBlank(message = "이름은 공백이 될 수 없습니다.")
        @Size(min = 1, max = 20, message = "이름은 20자 이하 입니다.")
        String name,
        @NotNull(message = "설명은 필수 입니다.")
        @NotBlank(message = "설명은 공백이 될 수 없습니다.")
        @Size(min = 1, max = 200, message = "설명은 200자 이하 입니다.")
        String description,
        @Digits(integer = 20, fraction = 0, message = "Px파일 번호는 20자리 이하의 숫자 입니다.")
        Long fileInfoId,
        @NotNull(message = "poiSet 필수 입니다.")
        Long poiSetId,
        LodSettings lodSettings,
        String topology
) {
}
