package com.pluxity.ktds.domains.api.parking.service;

import com.pluxity.ktds.domains.api.parking.dto.ParkPoiApiResponse;
import com.pluxity.ktds.domains.api.parking.dto.ParkPoisApiResponseDTO;
import com.pluxity.ktds.domains.parking.entity.ParkPoi;
import com.pluxity.ktds.domains.parking.repository.ParkPoiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ParkPoiApiService {

    private final ParkPoiRepository parkPoiRepository;

    @Transactional(readOnly = true)
    public ParkPoisApiResponseDTO parkPoisAll() {
        List<ParkPoiApiResponse> pois = parkPoiRepository.findAll().stream()
                .map(this::toPoiApiResponse)
                .toList();
        return ParkPoisApiResponseDTO.builder()
                .parkPois(pois)
                .build();
    }

    @Transactional(readOnly = true)
    public ParkPoisApiResponseDTO poisByFloor(String floorNm) {
        List<ParkPoiApiResponse> pois = parkPoiRepository.findAll().stream()
                .filter(p -> Objects.equals(p.getFloorNm(), floorNm))
                .map(this::toPoiApiResponse)
                .toList();
        return ParkPoisApiResponseDTO.builder()
                .parkPois(pois)
                .build();
    }

    private ParkPoiApiResponse toPoiApiResponse(ParkPoi parkPoi) {
        String floorNm = parkPoi.getFloorNm();
        String type = parkPoi.getPoiType() == null ? null : parkPoi.getPoiType().name();
        String sideType = parkPoi.getParkSideType() == null ? null : parkPoi.getParkSideType().name();
        Double x = parkPoi.getLongitude() == null ? null : parkPoi.getLongitude().doubleValue();
        Double y = parkPoi.getLatitude() == null ? null : parkPoi.getLatitude().doubleValue();
        return new ParkPoiApiResponse(floorNm, type, sideType, parkPoi.getId(), parkPoi.getName(), x, y);
    }
}
