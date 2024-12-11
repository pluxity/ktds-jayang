package com.pluxity.ktds.domains.building.dto;

import lombok.Builder;

@Builder
public record FileInfoDTO(
        Long id,
        String originName,
        String extension,
        String directory,
        String storedName,
        String fileEntityType
) {
}
