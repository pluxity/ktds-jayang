package com.pluxity.ktds.domains.building.controller;

import com.pluxity.ktds.domains.building.dto.CreatePoiDTO;
import com.pluxity.ktds.domains.building.dto.PoiDetailResponseDTO;
import com.pluxity.ktds.domains.building.dto.PoiResponseDTO;
import com.pluxity.ktds.domains.building.dto.UpdatePoiDTO;
import com.pluxity.ktds.domains.building.entity.Spatial;
import com.pluxity.ktds.domains.building.service.PoiService;
import com.pluxity.ktds.global.constant.SuccessCode;
import com.pluxity.ktds.global.response.ResponseBody;
import com.pluxity.ktds.global.response.DataResponseBody;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_DELETE;
import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_PATCH;

@RestController
@RequiredArgsConstructor
@RequestMapping("/poi")
public class PoiController {
    private final PoiService service;

//    @GetMapping
//    public DataResponseBody<List<PoiResponseDTO>> getPoiAll() {
//        return DataResponseBody.of(service.findAll());
//    }

    @GetMapping
    public DataResponseBody<List<PoiDetailResponseDTO>> getPoiAllDetail() {
        return DataResponseBody.of(service.findAllDetail());
    }

    @GetMapping("/poi-category/{id}")
    public DataResponseBody<List<PoiDetailResponseDTO>> getPoiByCategoryId(@PathVariable Long id) {
        return DataResponseBody.of(service.findByCategoryId(id));
    }

    @GetMapping("/building/{id}")
    public DataResponseBody<List<PoiDetailResponseDTO>> getPoisByBuildingId(@PathVariable Long id) {
        return DataResponseBody.of(service.findPoisByBuildingId(id));
    }

    @GetMapping("/floor/{id}")
    public DataResponseBody<List<PoiDetailResponseDTO>> getPoisFloorId(@PathVariable Long id) {
        return DataResponseBody.of(service.findPoisByFloorId(id));
    }

    @GetMapping("/{id}")
    public DataResponseBody<PoiDetailResponseDTO> getPoi(@PathVariable Long id) {
        return DataResponseBody.of(service.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DataResponseBody<Long> postPoi(@Valid @RequestBody CreatePoiDTO dto) {
        return DataResponseBody.of(service.save(dto));
    }


    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody patchPoi(@PathVariable Long id, @Valid @RequestBody UpdatePoiDTO dto) {
        service.updatePoi(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @PatchMapping("/{id}/position")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchPoiProperties(@PathVariable Long id, @Valid @RequestBody Spatial dto) {
        service.updatePosition(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @PatchMapping("/{id}/rotation")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchPoiRotation(@PathVariable Long id, @Valid @RequestBody Spatial dto) {
        service.updateRotation(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @PatchMapping("/{id}/scale")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchPoiScale(@PathVariable Long id, @Valid @RequestBody Spatial dto) {
        service.updateScale(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody deletePoi(@PathVariable Long id) {
        service.delete(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }

    @DeleteMapping("/id-list/{ids}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody deletePois(@PathVariable List<Long> ids) {
        service.deleteAllById(ids);
        return ResponseBody.of(SuccessCode.SUCCESS_DELETE);
    }

    @PatchMapping("/un-allocation/{ids}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchPoiUnAllocation(@PathVariable List<Long> ids) {
        service.unAllocationPoi(ids);
        return ResponseBody.of(SuccessCode.SUCCESS_PATCH);
    }

    @PostMapping("/batch-register")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseBody postBatchPoi(@RequestParam(value = "buildingId") Long buildingId,
                                     @RequestParam(value = "floorId") Long floorId,
                                     @RequestBody MultipartFile file) {
        service.batchRegisterPoi(buildingId, floorId, file);
        return ResponseBody.of(SuccessCode.SUCCESS_CREATE);
    }

}
