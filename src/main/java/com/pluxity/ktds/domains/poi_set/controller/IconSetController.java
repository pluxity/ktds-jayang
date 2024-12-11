package com.pluxity.ktds.domains.poi_set.controller;

import com.pluxity.ktds.domains.building.dto.FileInfoDTO;
import com.pluxity.ktds.domains.poi_set.dto.IconSetFileRequestDTO;
import com.pluxity.ktds.domains.poi_set.dto.IconSetRequestDTO;
import com.pluxity.ktds.domains.poi_set.dto.IconSetResponseDTO;
import com.pluxity.ktds.domains.poi_set.service.IconSetService;
import com.pluxity.ktds.domains.plx_file.starategy.SaveImage;
import com.pluxity.ktds.domains.plx_file.starategy.SaveZipFile;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

import static com.pluxity.ktds.domains.plx_file.constant.FileEntityType.ICON2D;
import static com.pluxity.ktds.domains.plx_file.constant.FileEntityType.ICON3D;
import static com.pluxity.ktds.global.constant.SuccessCode.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/icon-sets")
public class IconSetController {

    private final IconSetService service;

    private final SaveImage imageStrategy;

    private final SaveZipFile zipStrategy;

    @PostMapping(value = "/upload/image")
    @ResponseStatus(HttpStatus.CREATED)
    public DataResponseBody<FileInfoDTO> uploadImageIcon(
            @RequestParam("file") MultipartFile multipartFile
    ) throws IOException {
        IconSetFileRequestDTO dto = IconSetFileRequestDTO.builder()
                .type(ICON2D)
                .strategy(imageStrategy)
                .file(multipartFile)
                .build();

        return DataResponseBody.of(service.saveIconFile(dto));
    }

    @PostMapping(value = "/upload/zip")
    @ResponseStatus(HttpStatus.CREATED)
    public DataResponseBody<FileInfoDTO> uploadZipIcon(
            @RequestParam("file") MultipartFile multipartFile
    ) throws IOException {
        IconSetFileRequestDTO dto = IconSetFileRequestDTO.builder()
                .type(ICON3D)
                .strategy(zipStrategy)
                .file(multipartFile)
                .build();

        return DataResponseBody.of(service.saveIconFile(dto));
    }

    @GetMapping
    public DataResponseBody<List<IconSetResponseDTO>> getIconSets() {
        return DataResponseBody.of(service.findAll());
    }

    @GetMapping("/{id}")
    public DataResponseBody<IconSetResponseDTO> getIconSet(@PathVariable Long id) {
        return DataResponseBody.of(service.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DataResponseBody<Long> postIconSet(
            @Valid @RequestBody IconSetRequestDTO requestDTO
    ) {
        return DataResponseBody.of(SUCCESS_CREATE, service.save(requestDTO));
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseBody patchIconSet(
            @PathVariable Long id,
            @Valid @RequestBody IconSetRequestDTO requestDTO
    ) {
        service.update(id, requestDTO);
        return ResponseBody.of(SUCCESS_PATCH);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody deleteIconSet(@PathVariable Long id) {
        service.delete(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }
}
