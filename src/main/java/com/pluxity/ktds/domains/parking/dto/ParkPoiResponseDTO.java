package com.pluxity.ktds.domains.parking.dto;

import com.pluxity.ktds.domains.building.entity.Spatial;
import com.pluxity.ktds.domains.parking.enums.ParkPoiType;
import com.pluxity.ktds.domains.parking.enums.ParkSideType;
import lombok.Builder;

@Builder
public record ParkPoiResponseDTO(
        Long id,
        Long buildingId,
        Integer floorNo,
        String floorNm,
        Spatial position,
        Spatial rotation,
        Spatial scale,
        Long latitude,
        Long longitude,
        String name,
        ParkPoiType poiType,
        ParkSideType parkSideType
) {
}
