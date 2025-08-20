package com.pluxity.ktds.domains.parking.service;

import com.pluxity.ktds.domains.parking.dto.ParkPoiResponseDTO;
import com.pluxity.ktds.domains.parking.entity.ParkPoi;
import com.pluxity.ktds.domains.parking.repository.ParkPoiRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParkPoiService {

    private final ParkPoiRepository parkPoiRepository;
    public List<ParkPoiResponseDTO> findAll() {
        return parkPoiRepository.findAll().stream()
                .map(ParkPoi::toResponseDTO)
                .toList();
    }

    public List<ParkPoi> findByParkingId(Long parkingId) {
        return null;
    }
}
