package com.pluxity.ktds.domains.api.parking.dto;

public record ParkPoiApiResponse(
        String floorNm,
        String type,
        String sideType,
        Long id,
        String name,
        Double x,
        Double y
) {
}
