package com.pluxity.ktds.domains.parking.controller;

import com.pluxity.ktds.domains.parking.dto.ApiResponse;
import com.pluxity.ktds.domains.parking.dto.ParkPoiApiDTOs.*;
import com.pluxity.ktds.domains.parking.service.ParkPoiApiService;
import com.pluxity.ktds.domains.parking.service.ParkPoiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/park/poi")
public class ParkPoiApiController {
    private final ParkPoiApiService parkPoiApiService;

    @GetMapping
    public ApiResponse<ParkPoisResponse> getAllParkPois() {
        return ApiResponse.ok(parkPoiApiService.parkPoisAll());
    }

    @GetMapping("/{floorNm}")
    public ApiResponse<ParkPoisResponse> getParkPoiByName(@PathVariable String floorNm) {
        return ApiResponse.ok(parkPoiApiService.poisByFloor(floorNm));
    }
}
