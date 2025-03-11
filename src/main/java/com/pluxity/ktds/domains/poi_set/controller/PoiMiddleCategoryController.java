package com.pluxity.ktds.domains.poi_set.controller;

import com.pluxity.ktds.domains.poi_set.dto.PoiCategoryRequestDTO;
import com.pluxity.ktds.domains.poi_set.dto.PoiCategoryResponseDTO;
import com.pluxity.ktds.domains.poi_set.dto.PoiMiddleCategoryRequestDTO;
import com.pluxity.ktds.domains.poi_set.dto.PoiMiddleCategoryResponseDTO;
import com.pluxity.ktds.domains.poi_set.service.PoiMiddleCategoryService;
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
@RequestMapping("/poi-middle-categories")
public class PoiMiddleCategoryController {

    private final PoiMiddleCategoryService poiMiddleCategoryService;

    @GetMapping
    public DataResponseBody<List<PoiMiddleCategoryResponseDTO>> getPoiCategories() {
        return DataResponseBody.of(poiMiddleCategoryService.findAll());
    }

    @GetMapping("/{id}")
    public DataResponseBody<PoiMiddleCategoryResponseDTO> getPoiCategory(@PathVariable Long id) {
        return DataResponseBody.of(poiMiddleCategoryService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DataResponseBody<Long> postPoiCategory(
            @Valid @RequestBody PoiMiddleCategoryRequestDTO requestDto
    ) {
        return DataResponseBody.of(poiMiddleCategoryService.save(requestDto));
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchPoiCategory(
            @PathVariable Long id,
            @Valid @RequestBody PoiMiddleCategoryRequestDTO requestDto
    ) {
        poiMiddleCategoryService.update(id, requestDto);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody deletePoiCategory(@PathVariable Long id) {
        poiMiddleCategoryService.delete(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }
}
