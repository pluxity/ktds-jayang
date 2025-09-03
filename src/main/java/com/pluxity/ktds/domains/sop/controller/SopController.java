package com.pluxity.ktds.domains.sop.controller;

import com.pluxity.ktds.domains.building.dto.FileInfoDTO;
import com.pluxity.ktds.domains.plx_file.constant.FileEntityType;
import com.pluxity.ktds.domains.plx_file.starategy.SaveImage;
import com.pluxity.ktds.domains.sop.dto.CreateSopDTO;
import com.pluxity.ktds.domains.sop.dto.SopResponseDTO;
import com.pluxity.ktds.domains.sop.dto.UpdateSopDTO;
import com.pluxity.ktds.domains.sop.service.SopService;
import com.pluxity.ktds.global.response.DataResponseBody;
import com.pluxity.ktds.global.response.ResponseBody;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

import static com.pluxity.ktds.global.constant.SuccessCode.*;
import static com.pluxity.ktds.global.constant.SuccessCode.SUCCESS_DELETE;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sop")
public class SopController {

    private final SopService sopService;
    private final SaveImage saveImage;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseBody postSop(@RequestBody CreateSopDTO createSopDTO) {
        sopService.save(createSopDTO);
        return ResponseBody.of(SUCCESS_CREATE);
    }

    @GetMapping
    public DataResponseBody<List<SopResponseDTO>> getAllSop() {
        List<SopResponseDTO> sopList = sopService.findAll();
        return DataResponseBody.of(sopList);
    }

    @GetMapping("/{id}")
    public DataResponseBody<SopResponseDTO> getSop(@PathVariable Long id) {
        return DataResponseBody.of(sopService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseBody updateSop(
            @PathVariable Long id,
            @RequestBody UpdateSopDTO updateSopDTO) {
        sopService.updateSop(id, updateSopDTO);
        return ResponseBody.of(SUCCESS_PUT);
    }

    @DeleteMapping("/{id}")
    public ResponseBody deleteSop(@PathVariable Long id) {
        sopService.deleteSop(id);
        return ResponseBody.of(SUCCESS_DELETE);
    }

    @DeleteMapping("/id-list/{ids}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseBody deleteSopList(@PathVariable List<Long> ids) {
        sopService.deleteAllSop(ids);
        return ResponseBody.of(SUCCESS_DELETE);
    }

    @PostMapping(value = "/upload/file")
    @ResponseStatus(HttpStatus.CREATED)
    public DataResponseBody<FileInfoDTO> uploadSopFile(
            @RequestParam("file") MultipartFile multipartFile
    ) throws IOException {

        return DataResponseBody.of(sopService.saveFile(multipartFile, FileEntityType.ICON2D, saveImage));
    }
}
