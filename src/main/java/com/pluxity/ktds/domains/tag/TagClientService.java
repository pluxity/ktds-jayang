package com.pluxity.ktds.domains.tag;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pluxity.ktds.domains.tag.dto.TagResponseDTO;
import com.pluxity.ktds.global.response.ResponseBody;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.w3c.dom.html.HTMLParagraphElement;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class TagClientService {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private final String ACCESS_KEY = "SCADA";
    private final String BASE_URL = "http://1094.iptime.org";
    public TagClientService(ObjectMapper objectMapper, RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
                .additionalMessageConverters(new StringHttpMessageConverter(StandardCharsets.UTF_8))
                .rootUri(BASE_URL)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("access-key", ACCESS_KEY)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.objectMapper = objectMapper;
    }

    // 감시태그 등록(태그 추가 -> 모니터링)
    public ResponseEntity<String> addTags(List<String> tags) throws JsonProcessingException {
        try {
            String requestStr = objectMapper.writeValueAsString(tags);
            HttpEntity<String> request = new HttpEntity<>(requestStr);
            ResponseEntity<String> response = restTemplate.exchange(
                    "/?addtags",
                    HttpMethod.POST,
                    request,
                    String.class
            );
            return response;
        } catch (RestClientException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Service Unavailable : " + e.getMessage());
        }

    }

    // 태그 값 읽기
    public ResponseEntity<String> readTags(List<String> tags) throws JsonProcessingException {
        try {
            String requestStr = objectMapper.writeValueAsString(tags);
            HttpEntity<String> request = new HttpEntity<>(requestStr);
            ResponseEntity<String> response = restTemplate.exchange(
                    "/?ReadTags",
                    HttpMethod.POST,
                    request,
                    String.class
            );
            return response;
        } catch (RestClientException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Service Unavailable : " + e.getMessage());
        }
    }

    // 태그 값 COV(Change of Value)읽기
    // 모니터링 태그들 중 변경된 태그들의 현재값 읽기
    // timestamp = 0 -> 모든 태그의 현재값 / timestamp = 현재시간 -> 이후에 변경된 태그들의 값
    public ResponseEntity<String> readCOVs(long timestamp) throws JsonProcessingException {
        try {
            String requestStr = objectMapper.writeValueAsString(Map.of("Timestamp", timestamp));
            HttpEntity<String> request = new HttpEntity<>(requestStr);
            ResponseEntity<String> response = restTemplate.exchange(
                    "/?ReadCOVs",
                    HttpMethod.POST,
                    request,
                    String.class
            );
            return response;
        } catch (RestClientException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Service Unavailable : " + e.getMessage());
        }
    }

    // 태그 값 쓰기
    public ResponseEntity<String> writeTags(List<String> tags) throws JsonProcessingException {
        try {
            String requestStr = objectMapper.writeValueAsString(tags);
            HttpEntity<String> request = new HttpEntity<>(requestStr);
            ResponseEntity<String> response = restTemplate.exchange(
                    "/?WriteTags",
                    HttpMethod.POST,
                    request,
                    String.class
            );
            return response;
        } catch (RestClientException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Service Unavailable : " + e.getMessage());
        }
    }

    // 전체 태그값 읽기
    // 추가한 모든 태그들의 현재값
    public ResponseEntity<String> readAllTags() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setAcceptCharset(List.of(StandardCharsets.UTF_8));
            HttpEntity<String> request = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    "/?ReadAllTags",
                    HttpMethod.POST,
                    request,
                    String.class
            );
            return response;
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Service Unavailable : " + e.getMessage());
        }
    }

    // 감시태그 삭제
    // 추가한 태그 모니터링 중단
    public ResponseEntity<String> clearTags() throws JsonProcessingException {
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    "/?clearTags",
                    HttpMethod.POST,
                    null,
                    String.class
            );
            return response;
        } catch (RestClientException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Service Unavailable : " + e.getMessage());
        }
    }

    // 알람 이벤트 읽기
    public ResponseEntity<String> readAlarms(long timestamp) throws JsonProcessingException {
        try {
            String requestStr = objectMapper.writeValueAsString(Map.of("TimeStamp", timestamp));
            HttpEntity<String> request = new HttpEntity<>(requestStr);
            ResponseEntity<String> response = restTemplate.exchange(
                    "/?ReadAlarm",
                    HttpMethod.POST,
                    request,
                    String.class
            );
            return response;
        } catch (RestClientException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Service Unavailable : " + e.getMessage());
        }

    }

    // 알람 확인
    // 알람 확인처리
    public ResponseEntity<String> acknowledgeAlarm(List<String> tags) throws JsonProcessingException {
        try {
            String requestStr = objectMapper.writeValueAsString(tags);
            HttpEntity<String> request = new HttpEntity<>(requestStr);
            ResponseEntity<String> response = restTemplate.exchange(
                    "/?ackalarm",
                    HttpMethod.POST,
                    request,
                    String.class
            );
            return response;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Service Unavailable : " + e.getMessage());
        }
    }

    // 알람 삭제
    // 확인된 알람 정보 삭제
    public ResponseEntity<String> deleteAlarm(List<String> tags) throws JsonProcessingException {
        try {
            String requestStr = objectMapper.writeValueAsString(tags);
            HttpEntity<String> request = new HttpEntity<>(requestStr);
            ResponseEntity<String> response = restTemplate.exchange(
                    "/?DeleteAlarm",
                    HttpMethod.POST,
                    request,
                    String.class
            );
            return response;
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Service Unavailable : " + e.getMessage());
        }
    }
}
