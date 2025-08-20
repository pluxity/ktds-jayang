package com.pluxity.ktds.domains.tag.service;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/parking")
@RequiredArgsConstructor
public class ParkingDataController {

    private final ParkingDataService parkingDataService;

    @GetMapping
    public List<Map<String, Object>> getAllData() {
        return parkingDataService.getAllColumn();
    }

    @GetMapping("/search")
    public List<Map<String, Object>> searchData(
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime,
            @RequestParam(required = false) String deviceId,
            @RequestParam(required = false) String inoutType,
            @RequestParam(required = false) String exitId,
            @RequestParam(required = false) String regularType,
            @RequestParam(required = false) String searchType,
            @RequestParam(required = false) String parkingLotName,
            @RequestParam(required = false) String parkSearchInput
    ) {
        return parkingDataService.searchInput(
                startTime,
                endTime,
                deviceId,
                inoutType,
                exitId,
                regularType,
                searchType,
                parkingLotName,
                parkSearchInput
        );
    }
}
