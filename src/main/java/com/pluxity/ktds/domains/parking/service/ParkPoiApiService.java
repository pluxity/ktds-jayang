package com.pluxity.ktds.domains.parking.service;

import com.pluxity.ktds.domains.building.dto.PoiResponseDTO;
import com.pluxity.ktds.domains.parking.dto.ParkPoiApiDTOs;
import com.pluxity.ktds.domains.parking.dto.ParkPoiApiDTOs.*;
import com.pluxity.ktds.domains.parking.entity.ParkPoi;
import com.pluxity.ktds.domains.parking.repository.ParkPoiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ParkPoiApiService {

    private final ParkPoiRepository parkPoiRepository;

    @Transactional(readOnly = true)
    public ParkPoisResponse parkPoisAll() {
        return new ParkPoisResponse(parkPoiRepository.findAll().stream().map(this::toPoiRes).toList());
    }

    public ParkPoisResponse poisByFloor(String floorNm) {
        return new ParkPoisResponse(
                parkPoiRepository.findAll().stream()
                        .filter(p -> Objects.equals(p.getFloorNm(), floorNm))
                        .map(this::toPoiRes)
                        .toList()
        );
    }

    private ParkPoiRes toPoiRes(ParkPoi parkPoi) {
        String floorNm = parkPoi.getFloorNm();
        String type = parkPoi.getPoiType() == null ? null : parkPoi.getPoiType().name();
        String sideType = parkPoi.getParkSideType() == null ? null : parkPoi.getParkSideType().name();
        Double x = parkPoi.getLongitude() == null ? null : parkPoi.getLongitude().doubleValue();
        Double y = parkPoi.getLatitude()  == null ? null : parkPoi.getLatitude().doubleValue();
        return new ParkPoiRes(floorNm, type, sideType, parkPoi.getName(), x, y);
    }
}
