package com.pluxity.ktds.domains.cctv.dto;

public record CctvResponseDTO(
        Long id,
        String name,
        String code,
        String url,
        String description
) {

}
