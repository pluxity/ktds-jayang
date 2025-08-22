package com.pluxity.ktds.domains.api.parking.controller;

import com.pluxity.ktds.domains.api.parking.dto.ParkingSearchRequest;
import com.pluxity.ktds.domains.api.parking.service.ParkPoiApiService;
import com.pluxity.ktds.domains.tag.service.ParkingDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/park")
public class ParkPoiApiController {
    private final ParkPoiApiService parkPoiApiService;
    private final ParkingDataService parkingDataService;

    @GetMapping("/pois")
    public ResponseEntity<?> getAllParkPois() {
        return ResponseEntity.ok(parkPoiApiService.parkPoisAll());
    }

    @GetMapping("/pois/floor/{floorNm}")
    public ResponseEntity<?> getPoisByFloor(@PathVariable String floorNm) {
        return ResponseEntity.ok(parkPoiApiService.poisByFloor(floorNm));
    }

    @PostMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchParkingData(
            @RequestBody ParkingSearchRequest request) {
        List<Map<String, Object>> result = parkingDataService.searchByTimeAndInoutType(
                request.startTime(),
                request.endTime()
        );
        return ResponseEntity.ok(result);
    }

}
