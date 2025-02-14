package com.pluxity.ktds.domains.patrol.service;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.pluxity.ktds.domains.building.entity.Building;
import com.pluxity.ktds.domains.building.entity.Floor;
import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.building.repostiory.BuildingRepository;
import com.pluxity.ktds.domains.building.repostiory.FloorRepository;
import com.pluxity.ktds.domains.building.repostiory.PoiRepository;
import com.pluxity.ktds.domains.patrol.dto.*;
import com.pluxity.ktds.domains.patrol.entity.Patrol;
import com.pluxity.ktds.domains.patrol.entity.PatrolPoint;
import com.pluxity.ktds.domains.patrol.repository.PatrolPointRepository;
import com.pluxity.ktds.domains.patrol.repository.PatrolRepository;

import com.pluxity.ktds.global.exception.CustomException;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static com.pluxity.ktds.global.constant.ErrorCode.*;

@RequiredArgsConstructor
@Service
public class PatrolService {

    private final BuildingRepository buildingRepository;

    private final FloorRepository floorRepository;

    private final PatrolRepository patrolRepository;

    private final PatrolPointRepository patrolPointRepository;

    private final PoiRepository poiRepository;

    @Transactional(readOnly = true)
    public List<PatrolResponseDTO> findAll() {

        return patrolRepository.findAll().stream()
                .map(Patrol::toResponseDto)
                .toList();
    }

    @Transactional
    public Long save(CreatePatrolDTO dto) {

        if (dto.name() == null || dto.name().isBlank()) {
            throw new CustomException(EMPTY_VALUE_NAME);
        }

        if(patrolRepository.existsByName(dto.name())) {
            throw new CustomException(DUPLICATE_PATROL_NAME);
        }

        Building building = getBuildingById(dto.buildingId());

        Patrol patrol = Patrol.builder()
                .name(dto.name())
                .build();
        patrol.changeBuilding(building);

        return patrolRepository.save(patrol).getId();

    }

    @Transactional
    public Long update(@NotNull final Long id, @NotNull final CreatePatrolDTO dto) {

        Patrol patrol = getPatrolById(id);

        patrol.changeBuilding(getBuildingById(dto.buildingId()));

        if(patrolRepository.existsByNameAndIdNot(dto.name(), patrol.getId())) {
            throw new CustomException(DUPLICATE_PATROL_NAME);
        }

        patrol.update(dto.name());

        return patrol.getId();
    }

    @Transactional
    public void delete(@NotNull final Long id) {
        Patrol patrol = getPatrolById(id);

        patrolRepository.delete(patrol);
    }

    @Transactional(readOnly = true)
    public PatrolResponseDTO findById(@NotNull final Long id) {
        return patrolRepository.findById(id)
                .orElseThrow(() -> new CustomException(NOT_FOUND_PATROL))
                .toResponseDto();
    }

    @Transactional
    public void updatePatrolAddPoint(Long id, CreatePatrolPointDTO dto) {

        Patrol patrol = getPatrolById(id);

        if(dto.pointLocation() == null) {
            throw new CustomException(EMPTY_POINT_LOCATION);
        }

        int max = patrol.getPatrolPoints()
                .stream()
                .mapToInt(PatrolPoint::getSortOrder)
                .max()
                .orElse(0);
        PatrolPoint patrolPoint = PatrolPoint.builder().sortOrder(max).point(dto.pointLocation()).build();
        patrolPoint.changePatrol(patrol);
        patrolPoint.changeFloor(getFloorById(dto.floorId()));

        patrol.addPatrolPoint(patrolPoint);

    }

    @Transactional
    public void updatePois(Long id, CreatePatrolPointDTO dto) {

        PatrolPoint patrolPoint = getPatrolPointById(id);
        List<Poi> poiList = dto.pois().stream().map(this::getPoiById).toList();
        patrolPoint.updatePois(poiList);
    }

    @Transactional
    public void updateName(Long id, UpdatePatrolPointDTO dto) {

        PatrolPoint patrolPoint = getPatrolPointById(id);
        patrolPoint.updateName(dto.name());
    }

    @Transactional
    public void deletePoint(Long id) {

        PatrolPoint patrolPoint = getPatrolPointById(id);
        Patrol patrol = patrolPoint.getPatrol();
        patrol.removePatrolPoint(patrolPoint);

    }

    private PatrolPoint getPatrolPointById(Long id) {
        return patrolPointRepository.findById(id).orElseThrow(() -> {
            throw new CustomException(NOT_FOUND_PATROL_POINT);
        });
    }

    private Floor getFloorById(Long id) {
        return floorRepository.findById(id).orElseThrow(() -> {
            throw new CustomException(NOT_FOUND_FLOOR);
        });
    }

    private Building getBuildingById(Long id) {
        return buildingRepository.findById(id).orElseThrow(() -> {
            throw new CustomException(NOT_FOUND_BUILDING);
        });
    }

    private Patrol getPatrolById(Long id) {
        return patrolRepository.findById(id).orElseThrow(() -> {
            throw new CustomException(NOT_FOUND_PATROL);
        });
    }

    private Poi getPoiByFloorId(Long id) {
        return poiRepository.findByFloorId(id).orElseThrow(() -> {
           throw new CustomException(NOT_FOUND_POI);
        });
    }

    private Poi getPoiById(Long id) {
        return poiRepository.findById(id).orElseThrow(() -> {
            throw new CustomException(NOT_FOUND_POI);
        });
    }
}
