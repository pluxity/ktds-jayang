package com.pluxity.ktds.domains.poi_set.dto;

import com.pluxity.ktds.domains.building.dto.FileInfoDTO;
import lombok.Builder;

@Builder
public record IconSetResponseDTO(
        Long id,
        String name,
        FileInfoDTO iconFile2D,
        FileInfoDTO iconFile3D
) {
}
