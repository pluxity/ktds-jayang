package com.pluxity.ktds.domains.plx_file.dto;

public record FileInfoResponseDTO(
        Long id,
        String originName,
        String extension,
        String storedName,
        String directory) {
}
