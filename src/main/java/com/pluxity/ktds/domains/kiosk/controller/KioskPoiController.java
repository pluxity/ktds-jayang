package com.pluxity.ktds.domains.kiosk.controller;

import com.pluxity.ktds.domains.building.dto.FileInfoDTO;
import com.pluxity.ktds.domains.building.entity.Spatial;
import com.pluxity.ktds.domains.kiosk.dto.*;
import com.pluxity.ktds.domains.kiosk.service.KioskPoiService;
import com.pluxity.ktds.domains.plx_file.constant.FileEntityType;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_PATCH;

@RestController
@RequestMapping("/kiosk")
@RequiredArgsConstructor
public class KioskPoiController {

    private final KioskPoiService kioskPoiService;

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public DataResponseBody<?> getKioskPoi(@PathVariable Long id) {
        return DataResponseBody.of(kioskPoiService.findKioskPoiById(id));
    }

    @GetMapping
    public DataResponseBody<List<KioskAllPoiResponseDTO>> getPoiAll() {
        return DataResponseBody.of(kioskPoiService.findAll());
    }

    @GetMapping("/detailList")
    public DataResponseBody<List<Map<String, Object>>> getPoiAllDetail() {
        return DataResponseBody.of(kioskPoiService.findAllDetail());
    }

    @PostMapping("/upload/file")
    @ResponseStatus(HttpStatus.CREATED)
    public DataResponseBody<FileInfoDTO> postKioskFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) {
        KioskFileUploadDTO dto = KioskFileUploadDTO.builder()
                .file(file)
                .type(FileEntityType.valueOf(type.toUpperCase()))
                .build();
        return DataResponseBody.of(kioskPoiService.saveFile(dto));
    }

    @PostMapping("/store")
    @ResponseStatus(HttpStatus.CREATED)
    public DataResponseBody<Long> postStorePoi(@RequestBody CreateStorePoiDTO dto) {
        return DataResponseBody.of(kioskPoiService.saveStorePoi(dto));
    }

    @PostMapping("/kiosk")
    @ResponseStatus(HttpStatus.CREATED)
    public DataResponseBody<Long> postKioskPoi(@Valid @RequestBody CreateKioskPoiDTO dto) {
        return DataResponseBody.of(kioskPoiService.saveKioskPoi(dto));
    }

    @PutMapping(value = "/store/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody patchStorePoi(
            @PathVariable Long id,
            @RequestBody UpdateStorePoiDTO dto) {
        kioskPoiService.updateStore(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @PutMapping("/kiosk/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody patchKioskPoi(@PathVariable Long id, @Valid @RequestBody UpdateKioskPoiDTO dto) {
        kioskPoiService.updateKiosk(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }



    @PatchMapping("/{id}/position")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchPoiProperties(@PathVariable Long id, @Valid @RequestBody Spatial dto) {
        kioskPoiService.updatePosition(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @PatchMapping("/{id}/rotation")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchPoiRotation(@PathVariable Long id, @Valid @RequestBody Spatial dto) {
        kioskPoiService.updateRotation(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @PatchMapping("/{id}/scale")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchPoiScale(@PathVariable Long id, @Valid @RequestBody Spatial dto) {
        kioskPoiService.updateScale(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @PatchMapping("/un-allocation/{id}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchPoiUnAllocation(@PathVariable Long id) {
        kioskPoiService.unAllocationPoi(id);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody deleteKioskPoi(@PathVariable Long id) {
        kioskPoiService.deleteKioskPoi(id);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @DeleteMapping("/file/{fileId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody deleteKioskFile(@PathVariable Long fileId) {
        kioskPoiService.deleteFile(fileId);
        return ResponseBody.of(SUCCESS_PATCH);
    }

}