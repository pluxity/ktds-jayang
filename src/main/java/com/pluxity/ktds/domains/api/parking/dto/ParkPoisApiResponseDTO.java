package com.pluxity.ktds.domains.api.parking.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record ParkPoisApiResponseDTO(
        List<ParkPoiApiResponse> parkPois
) {
}
