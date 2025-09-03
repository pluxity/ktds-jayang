package com.pluxity.ktds.domains.api.parking.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;

@Builder
public record ParkingSearchRequest(

        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss.SSS")
        String startTime,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss.SSS")
        String endTime,
        String inoutType
) {
}
