package com.pluxity.ktds.domains.cctv.controller;

import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.building.service.PoiService;
import com.pluxity.ktds.domains.cctv.dto.PoiCctvDTO;
import com.pluxity.ktds.domains.cctv.entity.PoiCctv;
import com.pluxity.ktds.domains.cctv.service.CctvService;
import com.pluxity.ktds.global.response.DataResponseBody;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cctv")
@Slf4j
public class CctvController {

    private final CctvService cctvService;
    private final PoiService poiService;

    @GetMapping("/tag/{tagName}")
    public DataResponseBody<List<PoiCctvDTO>> getPoiCctvListByTagName(@PathVariable String tagName){
        Poi poi = poiService.findPoiIdsByTagName(tagName);
        List<PoiCctv> poiCctvByPoi = cctvService.findPoiCctvByPoi(poi);
        List<PoiCctvDTO> dtoList = poiCctvByPoi.stream()
                .map(PoiCctvDTO::from)
                .toList();
        return DataResponseBody.of(dtoList);
    }

}
