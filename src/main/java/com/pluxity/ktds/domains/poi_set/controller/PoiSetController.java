package com.pluxity.ktds.domains.poi_set.controller;

import com.pluxity.ktds.domains.building.dto.BuildingDetailResponseDTO;
import com.pluxity.ktds.domains.poi_set.dto.PoiSetRequestDTO;
import com.pluxity.ktds.domains.poi_set.dto.PoiSetResponseDTO;
import com.pluxity.ktds.domains.poi_set.service.PoiSetService;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_DELETE;
import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_PATCH;

@RestController
@RequiredArgsConstructor
@RequestMapping("/poi-sets")
public class PoiSetController {

    private final PoiSetService service;

    @GetMapping
    public DataResponseBody<List<PoiSetResponseDTO>> getPoiSets() {
        return DataResponseBody.of(service.findAll());
    }

    @GetMapping("/{id}")
    public DataResponseBody<PoiSetResponseDTO> getPoiSet(@PathVariable Long id) {
        return DataResponseBody.of(service.findById(id));
    }

    @GetMapping("/{id}/buildings")
    public DataResponseBody<List<BuildingDetailResponseDTO>> getPoiSetByBuilding(@PathVariable Long id) {
        return DataResponseBody.of(service.findBuildingsByPoiSetId(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DataResponseBody<Long> postPoiSet(
            @Valid @RequestBody PoiSetRequestDTO requestDto
    ) {
        return DataResponseBody.of(service.save(requestDto));
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchPoiSet(
            @PathVariable Long id,
            @Valid @RequestBody PoiSetRequestDTO requestDto
    ) {
        service.update(id, requestDto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody deletePoiSet(@PathVariable Long id) {
        service.delete(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }
}
