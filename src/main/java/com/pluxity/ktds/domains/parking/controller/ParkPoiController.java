package com.pluxity.ktds.domains.parking.controller;

import com.pluxity.ktds.domains.kiosk.dto.KioskAllPoiResponseDTO;
import com.pluxity.ktds.domains.parking.dto.ParkPoiResponseDTO;
import com.pluxity.ktds.domains.parking.service.ParkPoiService;
import com.pluxity.ktds.global.response.DataResponseBody;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/park")
@RequiredArgsConstructor
public class ParkPoiController {

    private final ParkPoiService parkPoiService;

    @GetMapping
    public DataResponseBody<List<ParkPoiResponseDTO>> getPoiAll() {
        return DataResponseBody.of(parkPoiService.findAll());
    }
}
