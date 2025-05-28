package com.pluxity.ktds.domains.building.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.pluxity.ktds.domains.tag.ElevatorTagManager;
import java.util.*;
import com.pluxity.ktds.domains.building.dto.CreatePoiDTO;
import com.pluxity.ktds.domains.building.dto.PoiDetailResponseDTO;
import com.pluxity.ktds.domains.building.dto.PoiResponseDTO;
import com.pluxity.ktds.domains.building.dto.UpdatePoiDTO;
import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.building.entity.Spatial;
import com.pluxity.ktds.domains.building.service.PoiService;
import com.pluxity.ktds.domains.tag.TagClientService;
import com.pluxity.ktds.global.constant.SuccessCode;
import com.pluxity.ktds.global.response.ResponseBody;
import com.pluxity.ktds.global.response.DataResponseBody;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
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
    private final TagClientService tagClientService;
    private final ObjectMapper objectMapper;

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
    public DataResponseBody<List<PoiDetailResponseDTO>> getPoisFloorId(@PathVariable Integer floorNo) {
        return DataResponseBody.of(service.findPoisByFloorNo(floorNo));
    }

    @GetMapping("/{id}")
    public DataResponseBody<PoiDetailResponseDTO> getPoi(@PathVariable Long id) {
        return DataResponseBody.of(service.findById(id));
    }

    @GetMapping("/tagNames/{tagName}")
    public DataResponseBody<Poi> findPoiByTagName(@PathVariable String tagName) {
        return DataResponseBody.of(service.findPoiIdsByTagName(tagName));
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
                                     @RequestParam(value = "floorNo") Integer floorNo,
                                     @RequestBody MultipartFile file) {
        service.batchRegisterPoi(buildingId, floorNo, file);
        return ResponseBody.of(SuccessCode.SUCCESS_CREATE);
    }

    @PostMapping("/status")
    public ResponseEntity<String> getPoiStatus(@RequestBody List<String> tags) throws JsonProcessingException {
        return null;
//        return tagClientService.readTags(tags);
    }

    private Map<String, Object> getPoiTagData(List<String> tags) {
        String tagDataStr = tagClientService.readTags(tags).getBody();
        try {
            JsonNode root = objectMapper.readTree(tagDataStr);
            int tagCnt = root.get("TAGCNT").asInt(0);
            ArrayNode tagsNode = (ArrayNode) root.withArray("TAGs");
            List<Map<String, Object>> mappedTags = new ArrayList<>();
            for (JsonNode node : tagsNode) {
                String fullTag = node.path("T").asText("");
                String rawValue = node.path("V").asText("");
                String suffix = "";
                int idx = fullTag.lastIndexOf('-');
                if (idx >= 0 && idx + 1 < fullTag.length()) {
                    suffix = fullTag.substring(idx + 1);
                }
                // 대분류에따라 이부분이 바뀔듯?
                ElevatorTagManager.ElevatorABTag tagEnum;
                tagEnum = ElevatorTagManager.ElevatorABTag.valueOf(suffix);
                String desc = tagEnum.getValueDescription(rawValue);
                if (desc == null) {
                    desc = rawValue;
                }
                mappedTags.add(Map.of(
                        "fullTag", fullTag,
                        "label",   tagEnum.getTagName(),
                        "value",   rawValue,
                        "desc",    desc
                ));
            }
            Map<String, Object> result = new HashMap<>();
            result.put("TAGCNT", tagCnt);
            result.put("TAGs", mappedTags);
            return result;
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

}
