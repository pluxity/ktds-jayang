package com.pluxity.ktds.domains.building.controller;

import com.pluxity.ktds.domains.building.dto.*;
import com.pluxity.ktds.domains.building.entity.LodSettings;
import com.pluxity.ktds.domains.building.service.BuildingService;
import com.pluxity.ktds.global.response.ResponseBody;
import com.pluxity.ktds.global.response.DataResponseBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_DELETE;
import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_PATCH;


@RestController
@RequiredArgsConstructor
@RequestMapping("/buildings")
public class BuildingController {

    private final BuildingService service;

//    @GetMapping
//    public DataResponseBody<List<BuildingResponseDTO>> getBuildings() {
//        return DataResponseBody.of(service.findAll());
//    }

    @GetMapping
    public DataResponseBody<List<BuildingDetailResponseDTO>> getBuildings() {
        return DataResponseBody.of(service.findDetailAll());
    }

    @GetMapping("/outdoor")
    public DataResponseBody<BuildingDetailResponseDTO> getOutdoorBuilding() {
        return DataResponseBody.of(service.findOutdoorDetail());
    }

    @GetMapping("/{id}")
    public DataResponseBody<BuildingDetailResponseDTO> getBuilding(@PathVariable Long id) {
        return DataResponseBody.of(service.findById(id));
    }

    @GetMapping("/{id}/floors")
    public DataResponseBody<List<FloorResponseDTO>> getFloorAll(@PathVariable Long id) {
        return DataResponseBody.of(service.findFloorById(id));
    }

    @GetMapping("/{id}/floors/{floorId}")
    public DataResponseBody<FloorResponseDTO> getFloorByFloorId(@PathVariable Long id, @PathVariable Long floorId) {
        return DataResponseBody.of(service.findFloorByFloorId(id, floorId));
    }

    @PostMapping("/upload/file")
    @ResponseStatus(HttpStatus.CREATED)
    public DataResponseBody<FileInfoDTO> postBuilding(@RequestBody MultipartFile file) throws IOException {
        return DataResponseBody.of(service.saveFile(file));
    }

    @PostMapping()
    @ResponseStatus(HttpStatus.CREATED)
    public DataResponseBody<Long> postBuilding(@Valid @RequestBody CreateBuildingDTO dto) {
        return DataResponseBody.of(service.saveBuilding(dto));
    }

    @PatchMapping("/{id}/force")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchBuildingForce(@PathVariable Long id,
                                           @Valid @RequestBody UpdateBuildingDTO dto) {
        service.updateForceBuilding(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody patchBuilding(@PathVariable Long id,
                                      @Valid @RequestBody UpdateBuildingDTO dto) {
        service.updateBuilding(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @PatchMapping("/{id}/lod")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchBuildingLod(@PathVariable Long id,
                                         @RequestBody LodSettings lodSettings) {
        service.updateLod(id, lodSettings);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @PatchMapping("/{id}/evacuationRoute")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchBuildingEvacuationRoute(@PathVariable Long id,
                                                     @RequestBody Map<String, String> evacuationRouteMap) {
        service.updateEvacuationRoute(id, evacuationRouteMap.get("evacuationRoute"));
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @PatchMapping("/{id}/topology")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchBuildingTopology(@PathVariable Long id,
                                              @RequestBody String topology) {
        service.updateTopology(id, topology);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody deleteBuilding(@PathVariable Long id) {
        service.delete(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }

    @DeleteMapping("/ids/{ids}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody deleteBuildings(@PathVariable List<Long> ids) {
        service.deleteAll(ids);
        return ResponseBody.of(SUCCESS_DELETE);
    }

    @PatchMapping("/{id}/camera2d")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchBuildingCamera2d(@PathVariable Long id,
                                              @RequestBody Map<String, String> camera2dMap) {
        service.updateCamera2d(id, camera2dMap.get("camera"));
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @PatchMapping("/{id}/camera3d")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchBuildingCamera3d(@PathVariable Long id,
                                              @RequestBody Map<String, String> camera3dMap) {
        service.updateCamera3d(id, camera3dMap.get("camera"));
        return ResponseBody.of(SUCCESS_PATCH);
    }
}
