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
    public DataResponseBody<Long> postStorePoi(
            @RequestPart("store") CreateStorePoiDTO store,
            @RequestPart(value = "logo", required = false) MultipartFile logo,
            @RequestPart(value = "bannerFiles", required = false) List<MultipartFile> bannerFiles
    ) {
        return DataResponseBody.of(kioskPoiService.saveStorePoi(store, logo, bannerFiles));
    }

    @PostMapping("/kiosk")
    @ResponseStatus(HttpStatus.CREATED)
    public DataResponseBody<Long> postKioskPoi(@Valid @RequestBody CreateKioskPoiDTO dto) {
        return DataResponseBody.of(kioskPoiService.saveKioskPoi(dto));
    }

    @PutMapping(value = "/store/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody patchStorePoi(
            @PathVariable Long id,
            @RequestPart("store") @Valid UpdateStorePoiDTO dto,
            @RequestPart(value = "logo", required = false) MultipartFile logoFile,
            @RequestPart(value = "bannerFiles", required = false) List<MultipartFile> bannerFiles
    ) {
        kioskPoiService.updateStore(id, dto, logoFile, bannerFiles);
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
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody deletePoi(@PathVariable Long id) {
        kioskPoiService.delete(id);
        return ResponseBody.of(SUCCESS_PATCH);
    }

}