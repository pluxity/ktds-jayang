package com.pluxity.ktds.domains.tag;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.*;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class TagClientService {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    @Value("${event.server.access-key}")
    private String accessKey;
    @Value("${event.server.base-url}")
    private String baseUrl;
    public TagClientService(ObjectMapper objectMapper) {
        this.restTemplate = new RestTemplate();
        this.restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));
        this.objectMapper = objectMapper;
    }

    private HttpHeaders setHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("access-key", accessKey);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        return headers;
    }

    // 감시태그 등록(태그 추가 -> 모니터링)
    public ResponseEntity<String> addTags(List<String> tags) {
        try {
            String requestStr = objectMapper.writeValueAsString(tags);
            HttpEntity<String> request = new HttpEntity<>(requestStr, setHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                    baseUrl + "/?addtags",
                    HttpMethod.POST,
                    request,
                    String.class
            );
            return response;
        } catch (RestClientException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Service Unavailable : " + e.getMessage());
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("JSON Processing Error : " + e.getMessage());
        }
    }

    // 태그 값 읽기
    public ResponseEntity<String> readTags(List<String> tags) {
        try {
            String requestStr = objectMapper.writeValueAsString(tags);
            HttpEntity<String> request = new HttpEntity<>(requestStr, setHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                    baseUrl + "/?ReadTags",
                    HttpMethod.POST,
                    request,
                    String.class
            );
            return response;
        } catch (RestClientException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Service Unavailable : " + e.getMessage());
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("JSON Processing Error : " + e.getMessage());
        }
    }

    // 태그 값 COV(Change of Value)읽기
    // 모니터링 태그들 중 변경된 태그들의 현재값 읽기
    // timestamp = 0 -> 모든 태그의 현재값 / timestamp = 현재시간 -> 이후에 변경된 태그들의 값
    public ResponseEntity<String> readCOVs(long timestamp) {
        try {
            String requestStr = objectMapper.writeValueAsString(Map.of("Timestamp", timestamp));
            HttpEntity<String> request = new HttpEntity<>(requestStr, setHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                    baseUrl + "/?ReadCOVs",
                    HttpMethod.POST,
                    request,
                    String.class
            );
            return response;
        } catch (RestClientException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Service Unavailable : " + e.getMessage());
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("JSON Processing Error : " + e.getMessage());
        }
    }

    // 태그 값 쓰기
    public ResponseEntity<String> writeTags(List<String> tags) {
        try {
            String requestStr = objectMapper.writeValueAsString(tags);
            HttpEntity<String> request = new HttpEntity<>(requestStr, setHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                    baseUrl + "/?WriteTags",
                    HttpMethod.POST,
                    request,
                    String.class
            );
            return response;
        } catch (RestClientException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Service Unavailable : " + e.getMessage());
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("JSON Processing Error : " + e.getMessage());
        }
    }

    // 전체 태그값 읽기
    // 추가한 모든 태그들의 현재값
    public ResponseEntity<String> readAllTags() {
        try {
            HttpEntity<String> request = new HttpEntity<>("{}", setHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                    baseUrl + "/?ReadAllTags",
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

    // 감시태그 삭제
    // 추가한 태그 모니터링 중단
    public ResponseEntity<String> clearTags() {
        try {
            HttpEntity<String> request = new HttpEntity<>(null, setHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                    baseUrl + "/?clearTags",
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

    // 알람 이벤트 읽기
    public ResponseEntity<String> readAlarms(long timestamp) {
        try {
            String requestStr = objectMapper.writeValueAsString(Map.of("TimeStamp", timestamp));
            HttpEntity<String> request = new HttpEntity<>(requestStr, setHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                    baseUrl + "/?ReadAlarm",
                    HttpMethod.POST,
                    request,
                    String.class
            );
            return response;
        } catch (RestClientException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Service Unavailable : " + e.getMessage());
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("JSON Processing Error : " + e.getMessage());
        }

    }

    // 알람 확인
    // 알람 확인처리
    public ResponseEntity<String> acknowledgeAlarm(List<String> tags) {
        try {
            String requestStr = objectMapper.writeValueAsString(tags);
            HttpEntity<String> request = new HttpEntity<>(requestStr, setHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                    baseUrl + "/?ackalarm",
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
    public ResponseEntity<String> deleteAlarm(List<String> tags) {
        try {
            String requestStr = objectMapper.writeValueAsString(tags);
            HttpEntity<String> request = new HttpEntity<>(requestStr, setHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                    baseUrl + "/?DeleteAlarm",
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
