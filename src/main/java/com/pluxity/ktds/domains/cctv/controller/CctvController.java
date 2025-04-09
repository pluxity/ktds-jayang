package com.pluxity.ktds.domains.cctv.controller;

import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.building.service.PoiService;
import com.pluxity.ktds.domains.cctv.dto.PoiCctvDTO;
import com.pluxity.ktds.domains.cctv.entity.PoiCctv;
import com.pluxity.ktds.domains.cctv.service.CctvService;
import com.pluxity.ktds.global.response.DataResponseBody;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cctv")
@Slf4j
public class CctvController {

    @Value("${cctv.ws-relay-url}")
    private String wsRelayUrl;
    @Value("${cctv.ws-relay-port}")
    private String wsRelayPort;
    @Value("${cctv.http-relay-url}")
    private String httpRelayUrl;
    @Value("${cctv.http-relay-port}")
    private String httpRelayPort;
    @Value("${cctv.LG-server-ip}")
    private String lgServerIp;
    @Value("${cctv.LG-server-Port}")
    private String lgServerPort;
    @Value("${cctv.LG-live-port}")
    private String lgLivePort;
    @Value("${cctv.LG-playback-port}")
    private String lgPlaybackPort;

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

    @GetMapping("/config")
    public DataResponseBody<Map<String, Object>> getCctvConfig(){
        Map<String, Object> config = new HashMap<>();
        config.put("wsRelayUrl", wsRelayUrl);
        config.put("wsRelayPort", wsRelayPort);
        config.put("httpRelayUrl", httpRelayUrl);
        config.put("httpRelayPort", httpRelayPort);
        config.put("lgServerIp", lgServerIp);
        config.put("lgServerPort", lgServerPort);
        config.put("lgLivePort", lgLivePort);
        config.put("lgPlaybackPort", lgPlaybackPort);
        return DataResponseBody.of(config);
    }

}
