package com.pluxity.ktds.domains.cctv.controller;

import com.pluxity.ktds.global.response.DataResponseBody;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
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
    @Value("${cctv.username}")
    private String username;
    @Value("${cctv.password}")
    private String password;

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
        config.put("username", username);
        config.put("password", password);
        return DataResponseBody.of(config);
    }

}
