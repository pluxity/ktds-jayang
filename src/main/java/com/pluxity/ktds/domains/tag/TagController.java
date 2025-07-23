package com.pluxity.ktds.domains.tag;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pluxity.ktds.domains.building.entity.Building;
import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.building.repostiory.PoiRepository;
import com.pluxity.ktds.domains.building.service.PoiService;
import com.pluxity.ktds.domains.tag.constant.AlarmStatus;
import com.pluxity.ktds.domains.tag.constant.TagStatus;
import com.pluxity.ktds.domains.tag.dto.TagData;
import com.pluxity.ktds.domains.tag.dto.TagResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tags")
public class TagController {

    private final RestTemplate restTemplate;

    private final ObjectMapper objectMapper;

    private final TagService tagService;

    @GetMapping("/elevator")
    public ResponseEntity<Map<Long, TagResponseDTO>> getElevatorTags(
            @RequestParam(value = "buildingId", required = false) Long buildingId,
            @RequestParam(value = "buildingName", required = false) String buildingName,
            @RequestParam("type") String type
    ) throws JsonProcessingException {
        Map<Long, TagResponseDTO> poiTagResponseMap = tagService.processElevTagDataByPoi(type, buildingId, buildingName);

        return ResponseEntity.ok(poiTagResponseMap);
    }

    @GetMapping("/escalator")
    public ResponseEntity<Map<Long, TagResponseDTO>> getEscalatorTags(
            @RequestParam("type") String type
    ) throws JsonProcessingException {
        Map<Long, TagResponseDTO> poiTagResponseMap = tagService.processEsclTagDataByPoi(type);

        return ResponseEntity.ok(poiTagResponseMap);
    }

    @GetMapping("/parking")
    public ResponseEntity<TagResponseDTO> getParkingTags() {
        TagResponseDTO poiTagResponseMap = tagService.processParkingTags();

        return ResponseEntity.ok(poiTagResponseMap);
    }
}
