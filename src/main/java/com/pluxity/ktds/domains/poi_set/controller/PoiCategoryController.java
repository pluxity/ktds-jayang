package com.pluxity.ktds.domains.poi_set.controller;

import com.pluxity.ktds.domains.building.dto.FileInfoDTO;
import com.pluxity.ktds.domains.poi_set.dto.PoiCategoryRequestDTO;
import com.pluxity.ktds.domains.poi_set.dto.PoiCategoryResponseDTO;
import com.pluxity.ktds.domains.poi_set.service.PoiCategoryService;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_DELETE;
import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_PATCH;

@RestController
@RequiredArgsConstructor
@RequestMapping("/poi-categories")
public class PoiCategoryController {

    private final PoiCategoryService service;

    @PostMapping(value = "/upload/image")
    @ResponseStatus(HttpStatus.CREATED)
    public DataResponseBody<FileInfoDTO> uploadImageIcon(
            @RequestParam("file") MultipartFile multipartFile
    ) throws IOException {
        return DataResponseBody.of(service.saveImageFile(multipartFile));
    }

    @GetMapping
    public DataResponseBody<List<PoiCategoryResponseDTO>> getPoiCategories() {
        return DataResponseBody.of(service.findAll());
    }

    @GetMapping("/{id}")
    public DataResponseBody<PoiCategoryResponseDTO> getPoiCategory(@PathVariable Long id) {
        return DataResponseBody.of(service.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DataResponseBody<Long> postPoiCategory(
            @Valid @RequestBody PoiCategoryRequestDTO requestDto
    ) {
        return DataResponseBody.of(service.save(requestDto));
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchPoiCategory(
            @PathVariable Long id,
            @Valid @RequestBody PoiCategoryRequestDTO requestDto
    ) {
        service.update(id, requestDto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody deletePoiCategory(@PathVariable Long id) {
        service.delete(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }
}
