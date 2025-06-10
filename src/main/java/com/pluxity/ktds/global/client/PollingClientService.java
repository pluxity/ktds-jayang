package com.pluxity.ktds.global.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;

@Service
public class PollingClientService {

    private final RestTemplate restTemplate;
    private final String BASE_URL = ""; // polling server url

    public PollingClientService(RestTemplateBuilder templateBuilder) {
        this.restTemplate = templateBuilder
                .additionalMessageConverters(new StringHttpMessageConverter(StandardCharsets.UTF_8))
                .rootUri(BASE_URL)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public ResponseEntity<Void> eventDisable(Long id) {
        String url = "/event-disable?id=" + id;
        return restTemplate.exchange(url, HttpMethod.GET, null, Void.class);
    }

}
