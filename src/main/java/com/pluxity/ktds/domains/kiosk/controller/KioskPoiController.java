package com.pluxity.ktds.domains.kiosk.controller;

import com.pluxity.ktds.domains.building.dto.FileInfoDTO;
import com.pluxity.ktds.domains.building.entity.Spatial;
import com.pluxity.ktds.domains.kiosk.dto.*;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import com.pluxity.ktds.domains.kiosk.service.KioskPoiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_DELETE;
import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_PATCH;


@RestController
@RequiredArgsConstructor
@RequestMapping("/kiosk")
public class KioskPoiController {

    private final KioskPoiService kioskPoiService;

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public DataResponseBody<?> getKioskPoi(@PathVariable Long id) {
        return DataResponseBody.of(kioskPoiService.findKioskPoiById(id));
    }

    @GetMapping
    public DataResponseBody<List<KioskAllPoiResponseRTO>> getPoiAll() {
        return DataResponseBody.of(kioskPoiService.findAll());
    }

    @PostMapping("/upload/file")
    @ResponseStatus(HttpStatus.CREATED)
    public DataResponseBody<FileInfoDTO> postKioskFile(@RequestBody KioskFileUploadDTO dto) {
        return DataResponseBody.of(kioskPoiService.saveFile(dto));
    }

    @PostMapping("/store")
    @ResponseStatus(HttpStatus.CREATED)
    public DataResponseBody<Long> postStorePoi(@Valid @RequestBody CreateStorePoiDTO dto) {
        return DataResponseBody.of(kioskPoiService.saveStorePoi(dto));
    }

    @PostMapping("/kiosk")
    @ResponseStatus(HttpStatus.CREATED)
    public DataResponseBody<Long> postKioskPoi(@Valid @RequestBody CreateKioskPoiDTO dto) {
        return DataResponseBody.of(kioskPoiService.saveKioskPoi(dto));
    }

    @PutMapping("/kiosk/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody patchStorePoi(@PathVariable Long id, @Valid @RequestBody UpdateStorePoiDTO dto) {
        kioskPoiService.updateStore(id, dto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @PutMapping("/store/{id}")
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

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody deletePoi(@PathVariable Long id) {
        kioskPoiService.delete(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }

}