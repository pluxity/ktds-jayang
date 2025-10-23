package com.pluxity.ktds.domains.tag;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pluxity.ktds.domains.tag.constant.TagStatus;
import com.pluxity.ktds.domains.tag.dto.AlarmData;
import com.pluxity.ktds.domains.tag.dto.AlarmResponseDTO;
import com.pluxity.ktds.domains.tag.dto.TagData;
import com.pluxity.ktds.domains.tag.dto.TagResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.*;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class TagClientService {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${event.server.access-key}")
    private String accessKey;

    @Value("${event.server.base-url}")
    private String baseUrl;

    @Value("${tag.client.max-retries}")
    private int maxRetries;

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
        int retryCount = 0;
        int tagSize = tags.size();

        while (retryCount < maxRetries) {
            try {
                String requestStr = objectMapper.writeValueAsString(tags);
                HttpEntity<String> request = new HttpEntity<>(requestStr, setHeaders());

                ResponseEntity<String> response = restTemplate.exchange(
                        baseUrl + "/?AddTags",
                        HttpMethod.POST,
                        request,
                        String.class
                );

                // 응답 검증
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                int addTagsValue = jsonNode.get("AddTags").asInt();


                if (addTagsValue == tagSize) {
                    return response; // 성공 시 즉시 반환
                }

                // 응답값이 tagSize와 다르면 재시도
                retryCount++;
                if (retryCount < maxRetries) {
                    try {
                        Thread.sleep(1000 * retryCount); // 재시도 간격을 점진적으로 증가
                        log.info("retryCount = {}, tagSize = {}", retryCount, tagSize);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Interrupted during retry");
                    }
                }

            } catch (RestClientException e) {
                retryCount++;
                if (retryCount >= maxRetries) {
                    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                            .body("Service Unavailable after " + maxRetries + " retries: " + e.getMessage());
                }
                // 재시도 간격
                try {
                    Thread.sleep(1000 * retryCount);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Interrupted during retry");
                }
            } catch (JsonProcessingException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("JSON Processing Error : " + e.getMessage());
            }
        }

        // 최대 재시도 횟수 초과
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("Maximum retry attempts (" + maxRetries + ") exceeded. Expected: " + tagSize + " tags to be added");
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
                    baseUrl + "/?ClearTags",
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

    public ResponseEntity<String> testReadTags(List<String> tags) {
        int retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                String requestStr = objectMapper.writeValueAsString(
                        tags.stream()
                                .map(this::normalizeLiReTag)
                                .toList()
                );

                HttpEntity<String> request = new HttpEntity<>(requestStr, setHeaders());
                ResponseEntity<String> response = restTemplate.exchange(
                        baseUrl + "/?ReadTags",
                        HttpMethod.POST,
                        request,
                        String.class
                );

                if (response.getBody() == null) {
                    return ResponseEntity.status(HttpStatus.NO_CONTENT).body("No data");
                }
                TagResponseDTO rawResponse = objectMapper.readValue(response.getBody(), TagResponseDTO.class);

                List<TagData> processedTags = new ArrayList<>();
                boolean hasAbnormalStatus = false;

                for (TagData td : rawResponse.tags()) {

                    if (td.tagStatus() != TagStatus.NORMAL) {
                        hasAbnormalStatus = true;
                        break;
                    }

                    String tagName = td.tagName();
                    String[] parts = tagName.split("-");
                    String rawValue = td.currentValue();
                    String enumName = parts[parts.length - 1];
                    String desc = null;
                    String prefix = parts[0];
                    String category = parts[2];
                    String evMiddleCategory = parts[3];

                    try {
                        if("EV".equals(category)) {
                            if ("ELEV".equals(evMiddleCategory)) {
                                if ("A".equals(prefix) || "B".equals(prefix)) {
                                    desc = ElevatorTagManager.ElevatorABTag.valueOf(enumName).getValueDescription(rawValue);
                                } else {
                                    desc = ElevatorTagManager.ElevatorCTag.fromTagName(enumName).getValueDescription(rawValue);
                                }
                            } else if ("ESCL".equals(evMiddleCategory)) {
                                desc = ElevatorTagManager.EscalatorTag.valueOf(enumName).getValueDescription(rawValue);
                            }
                        } else if ("VAV".equals(category)) {
                            String s = parseSuffix(enumName);
                            desc = ElevatorTagManager.VavTag.valueOf(s).getValueDescription(rawValue);
                        } else if ("FU".equals(category)) {
                            desc = ElevatorTagManager.CellTag.valueOf(enumName).getValueDescription(rawValue);
                        } else {
                            desc = rawValue;
                        }

                    } catch (IllegalArgumentException e) {
                        desc = rawValue;
                    }

                    processedTags.add(new TagData(
                            tagName,
                            desc,
                            td.tagStatus(),
                            td.alarmStatus()
                    ));
                }

                // 모든 태그가 normal 상태인 경우에만 성공으로 처리
                if (!hasAbnormalStatus) {
                    TagResponseDTO processedDto = new TagResponseDTO(
                            processedTags.size(),
                            rawResponse.timestamp(),
                            processedTags
                    );

                    String resultJson = objectMapper.writeValueAsString(processedDto);
                    return ResponseEntity.ok(resultJson);
                }

                // abnormal 상태가 있는 경우 재시도
                retryCount++;
                if (retryCount < maxRetries) {
                    try {
                        Thread.sleep(1000 * retryCount); // 재시도 간격을 점진적으로 증가
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Interrupted during retry");
                    }
                }

            } catch (RestClientException e) {
                retryCount++;
                if (retryCount >= maxRetries) {
                    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                            .body("Service Unavailable after " + maxRetries + " retries: " + e.getMessage());
                }
                // 재시도 간격
                try {
                    Thread.sleep(1000 * retryCount);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Interrupted during retry");
                }
            } catch (JsonProcessingException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("JSON Processing Error : " + e.getMessage());
            }
        }

        // 최대 재시도 횟수 초과
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("Maximum retry attempts (" + maxRetries + ") exceeded due to abnormal tag status");
    }

    public ResponseEntity<String> testReadAlarm(List<String> tags) {
        try {
            String requestStr = objectMapper.writeValueAsString(tags);
            HttpEntity<String> request = new HttpEntity<>(requestStr, setHeaders());
            ResponseEntity<String> response = restTemplate.exchange(
                    baseUrl + "/?ReadAlarm",
                    HttpMethod.POST,
                    request,
                    String.class
            );

            if (response.getBody() == null) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).body("No data");
            }
            AlarmResponseDTO rawResponse = objectMapper.readValue(response.getBody(), AlarmResponseDTO.class);

            List<AlarmData> processedTags = new ArrayList<>();
            for (AlarmData td : rawResponse.alarmDataList()) {
                String tagName = td.tagName();
                String[] parts = tagName.split("-");
                String rawValue = td.tagValue();
                String enumName = parts[parts.length - 1];
                String desc = null;
                String prefix = parts[0];
                String category = parts[2];
                String evMiddleCategory = parts[3];

                desc = rawValue;
                processedTags.add(new AlarmData(
                        td.occurrenceDate(),
                        tagName,
                        desc,
                        td.alarmStatus(),
                        td.alarmType(),
                        td.confirmStatus(),
                        td.confirmTime()
                ));
            }
            AlarmResponseDTO processedDto = new AlarmResponseDTO(
                    processedTags.size(),
                    rawResponse.timestamp(),
                    processedTags
            );

            String resultJson = objectMapper.writeValueAsString(processedDto);
            return ResponseEntity.ok(resultJson);
        } catch (RestClientException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Service Unavailable : " + e.getMessage());
        } catch (JsonProcessingException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("JSON Processing Error : " + e.getMessage());
        }
    }

    private String parseSuffix(String suffix) {
        // 4F_FPU_104105_PRI_FLOW_STPT -> PRI_FLOW_STPT
        String[] parts = suffix.split("_");
        if (parts.length > 3) {
            // 앞의 3개 부분(4F_FPU_104105_) 제거하고 나머지 부분들을 _로 연결
            StringBuilder result = new StringBuilder();
            for (int i = 3; i < parts.length; i++) {
                if (i > 3) {
                    result.append("_");
                }
                result.append(parts[i]);
            }
            return result.toString();
        }
        return suffix; // 3개 이하면 원본 반환
    }

    private String normalizeLiReTag(String tag) {
        int hit = tag.indexOf("-LI-RE-");
        if (hit < 0) return tag;

        int cut = tag.lastIndexOf('-');
        if (cut < 0) return tag;

        return tag.substring(0, cut).stripTrailing();
    }
}
