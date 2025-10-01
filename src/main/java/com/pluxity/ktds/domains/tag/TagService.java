package com.pluxity.ktds.domains.tag;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.building.entity.PoiTag;
import com.pluxity.ktds.domains.building.repostiory.PoiRepository;
import com.pluxity.ktds.domains.building.repostiory.PoiTagRepository;
import com.pluxity.ktds.domains.tag.constant.TagStatus;
import com.pluxity.ktds.domains.tag.dto.TagData;
import com.pluxity.ktds.domains.tag.dto.TagResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TagService {

    private final PoiRepository poiRepository;
    private final RestTemplate restTemplate;
    private final PoiTagRepository poiTagRepository;
    private final TagClientService tagClientService;
    private final ObjectMapper objectMapper;

    @Value("${event.server.base-url}")
    private String baseUrl;

    @Value("${tag.chunk-size}")
    private int TAG_CHUNK_SIZE ;

    @Value("${tag.read-strategy}")
    private String readStrategy;

    @Value("${event.server.access-key}")
    private String accessKey;

    @Value("${tag.client.max-retries}")
    private int maxRetries;

    @Transactional
    public Map<Long, TagResponseDTO> processElevTagDataByPoi(String type, Long buildingId, String buildingName) throws JsonProcessingException {

        List<Poi> pois = poiRepository.findByBuildingIdAndMiddleCategoryName(buildingId, "승강기");

        Map<Long, TagResponseDTO> poiTagResponseMap = new HashMap<>();
        List<String> allTagNamesToFetch = new ArrayList<>();
        Map<String, Long> tagNamePoiIdMap = new HashMap<>();

        for (Poi poi : pois) {
            Long poiId = poi.getId();
            String buildingNm = poi.getBuilding().getName();

            String mappedBuilding;
            if (buildingNm != null && buildingNm.contains("A")) {
                mappedBuilding = "A";
            } else if (buildingNm != null && buildingNm.contains("B")) {
                mappedBuilding = "B";
            } else {
                mappedBuilding = "C";
            }

            String prefix = type.equals("ELEV")
                    ? String.format("%s-null-EV-ELEV-", mappedBuilding)
                    : String.format("%s-null-EV-ESCL-", mappedBuilding);

            List<String> tagNamesList = poi.getTagNames();
            if (tagNamesList != null) {
                for (String tagName : tagNamesList) {
                    if (tagName.startsWith(prefix)) {
                        allTagNamesToFetch.add(tagName);
                        tagNamePoiIdMap.put(tagName, poiId);
                    }
                }
            }
        }

        allTagNamesToFetch.forEach(s -> log.info("tag = {}", s));

        int retryCount = 0;

        while (retryCount < maxRetries) {
            if (allTagNamesToFetch.isEmpty()) {
                break; // 처리할 태그가 없으면 종료
            }

            TagResponseDTO all = null;

            if ("CHUNK".equals(readStrategy)) {
                all = readTagsInChunks(allTagNamesToFetch);
            } else {
                String requestStr = objectMapper.writeValueAsString(allTagNamesToFetch);
                HttpEntity<String> request = new HttpEntity<>(requestStr, setHeaders());
                ResponseEntity<String> response = restTemplate.exchange(
                        baseUrl + "/?ReadTags",
                        HttpMethod.POST,
                        request,
                        String.class
                );

                all = objectMapper.readValue(response.getBody(), TagResponseDTO.class);
            }

            boolean hasAbnormalStatus = false;

            if (all != null && all.tags() != null) {
                Map<Long, List<TagData>> groupedTagData = all.tags().stream()
                        .filter(td -> tagNamePoiIdMap.containsKey(td.tagName()))
                        .collect(Collectors.groupingBy(td -> tagNamePoiIdMap.get(td.tagName())));

                Map<Long, TagResponseDTO> tempResponseMap = new HashMap<>();

                outer:
                for (Map.Entry<Long, List<TagData>> poiEntry : groupedTagData.entrySet()) {
                    Long poiId = poiEntry.getKey();
                    List<TagData> result = new ArrayList<>();
                    List<TagData> tagsForPoi = poiEntry.getValue();

                    for (TagData td : tagsForPoi) {

                        if (td.tagStatus() != TagStatus.NORMAL) {
                            log.info("retry : {} 시도", retryCount);
                            hasAbnormalStatus = true;
                            break outer; // 비정상 상태 발견 시 전체 재시도 위해 외부 루프 탈출
                        }

                        String full = td.tagName();
                        String raw = td.currentValue();
                        String enumName = full.substring(full.lastIndexOf('-') + 1);
                        String desc = null;

                        try {
                            if (type.equals("ELEV")) {
                                if (buildingName.contains("A") || buildingName.contains("B")) {
                                    desc = ElevatorTagManager.ElevatorABTag.valueOf(enumName).getValueDescription(raw);
                                } else {
                                    desc = ElevatorTagManager.ElevatorCTag.fromTagName(enumName).getValueDescription(raw);
                                }
                            } else {
                                desc = ElevatorTagManager.EscalatorTag.valueOf(enumName).getValueDescription(raw);
                            }
                        } catch (IllegalArgumentException e) {
                            e.printStackTrace();
                            desc = raw;
                        }

                        result.add(new TagData(full, desc, td.tagStatus(), td.alarmStatus()));
                    }

                    if (!result.isEmpty()) {
                        tempResponseMap.put(poiId, new TagResponseDTO(result.size(), all.timestamp(), result));
                    }
                }

                if (!hasAbnormalStatus) {
                    poiTagResponseMap.putAll(tempResponseMap);
                    break; // 정상 상태면 반복 종료
                }
            }

            // 비정상 상태면 재시도
            retryCount++;
            try {
                Thread.sleep(1000L * retryCount); // 점진적 재시도 간격
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error(e.getMessage());
            }
        }

        return poiTagResponseMap;
    }


    private HttpHeaders setHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("access-key", accessKey);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        return headers;
    }

    @Transactional
    public Map<Long, TagResponseDTO> processEsclTagDataByPoi(String type) throws JsonProcessingException {

        String prefix = "C-null-EV-ESCL-";

        List<Poi> pois = poiRepository.findByMiddleCategoryName("에스컬레이터");

        Map<Long, TagResponseDTO> poiTagResponseMap = new HashMap<>();
        List<String> allTagNamesToFetch = new ArrayList<>();
        Map<String, Long> tagNamePoiIdMap = new HashMap<>();

        for (Poi poi : pois) {
            Long poiId = poi.getId();
            List<String> tagNamesList = poi.getTagNames();
            if (tagNamesList != null) {
                for (String tagName : tagNamesList) {
                    if (tagName.startsWith(prefix)) {
                        allTagNamesToFetch.add(tagName);
                        tagNamePoiIdMap.put(tagName, poiId);
                    }
                }
            }
        }

        int retryCount = 0;

        while (retryCount < maxRetries) {

            if (allTagNamesToFetch.isEmpty()) {
                break;  // 처리할 태그가 없으면 바로 종료
            }

            TagResponseDTO all = null;

            if ("CHUNK".equals(readStrategy)) {
                all = readTagsInChunks(allTagNamesToFetch);
            } else {
                String requestStr = objectMapper.writeValueAsString(allTagNamesToFetch);
                HttpEntity<String> request = new HttpEntity<>(requestStr, setHeaders());
                ResponseEntity<String> response = restTemplate.exchange(
                        baseUrl + "/?ReadTags",
                        HttpMethod.POST,
                        request,
                        String.class
                );

                all = objectMapper.readValue(response.getBody(), TagResponseDTO.class);
            }

            boolean hasAbnormalStatus = false;

            if (all != null && all.tags() != null) {
                Map<Long, List<TagData>> groupedTagData = all.tags().stream()
                        .filter(td -> tagNamePoiIdMap.containsKey(td.tagName()))
                        .collect(Collectors.groupingBy(td -> tagNamePoiIdMap.get(td.tagName())));

                Map<Long, TagResponseDTO> tempResponseMap = new HashMap<>();

                for (Map.Entry<Long, List<TagData>> poiEntry : groupedTagData.entrySet()) {
                    Long poiId = poiEntry.getKey();
                    List<TagData> result = new ArrayList<>();
                    List<TagData> tagsForPoi = poiEntry.getValue();

                    for (TagData td : tagsForPoi) {

                        if (td.tagStatus() != TagStatus.NORMAL) {
                            log.info("retry : {} 시도", retryCount);
                            hasAbnormalStatus = true;
                            break; // 현재 POI에서 비정상 태그 발견시 루프 탈출
                        }

                        String full = td.tagName();
                        String raw = td.currentValue();
                        String enumName = full.substring(full.lastIndexOf('-') + 1);
                        String desc = null;

                        try {
                            if (type.equals("ESCL")) {
                                desc = ElevatorTagManager.EscalatorTag.valueOf(enumName).getValueDescription(raw);
                            }
                        } catch (IllegalArgumentException e) {
                            e.printStackTrace();
                            desc = raw;
                        }

                        result.add(new TagData(full, desc, td.tagStatus(), td.alarmStatus()));
                    }

                    if (!result.isEmpty()) {
                        tempResponseMap.put(poiId, new TagResponseDTO(result.size(), all.timestamp(), result));
                    }

                    if (hasAbnormalStatus) {
                        break;  // 태그 중 하나라도 비정상 상태가 있으면 전체 재시도 하도록 루프 탈출
                    }
                }

                if (!hasAbnormalStatus) {
                    // 비정상 상태가 없으면 결과 반영하고 루프 종료
                    poiTagResponseMap.putAll(tempResponseMap);
                    break;
                }
            }

            // 비정상 상태가 있으면 재시도 준비
            retryCount++;
            try {
                Thread.sleep(1000L * retryCount);  // 점진적으로 재시도 간격 증가
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error(e.getMessage());
            }
        }

        System.out.println("poiTagResponseMap : " + poiTagResponseMap);
        return poiTagResponseMap;
    }


    @Transactional
    public TagResponseDTO processParkingTags(boolean register) {

        List<String> parkingTags = List.of(
                "C-null-PK-GU-G-ParkTotal",
                "C-null-PK-GU-G-ParkEmpty",
                "C-null-PK-GU-G-Parking",
                "C-P1-PK-GU-null-Total",
                "C-P1-PK-GU-null-Empty",
                "C-P1-PK-GU-null-Parking",
                "C-P2-PK-GU-null-Total",
                "C-P2-PK-GU-null-Empty",
                "C-P2-PK-GU-null-Parking",
                "C-P3-PK-GU-null-Total",
                "C-P3-PK-GU-null-Empty",
                "C-P3-PK-GU-null-Parking",
                "C-P4-PK-GU-null-Total",
                "C-P4-PK-GU-null-Empty",
                "C-P4-PK-GU-null-Parking",
                "C-P5-PK-GU-null-Total",
                "C-P5-PK-GU-null-Empty",
                "C-P5-PK-GU-null-Parking"
        );

        if (register) {
            ResponseEntity<String> addRes = tagClientService.addTags(parkingTags);
            if (!addRes.getStatusCode().is2xxSuccessful()) {
                throw new IllegalStateException("addTags 실패: " + addRes.getStatusCode().value());
            }
        }

        ResponseEntity<String> response = tagClientService.testReadTags(parkingTags);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException("testReadTags 실패: " + response.getStatusCode().value());
        }

        if (response.getBody() == null) {
            throw new IllegalStateException("응답 데이터가 없습니다.");
        }

        try {
            return objectMapper.readValue(response.getBody(), TagResponseDTO.class);

        } catch (JsonProcessingException e) {
            throw new IllegalStateException("응답 데이터 파싱 실패: " + e.getMessage());
        }
    }

    @Transactional
    public int addAllElevatorTags() {
        List<String> tagNames = poiTagRepository.findByTagNameContaining("-EV-")
                .stream().map(PoiTag::getTagName).toList();
        return processTagsInChunks(tagNames, TAG_CHUNK_SIZE);
    }

    @Transactional
    public Map<String, Map<String, Double>> processAirConditionerTags() {

        List<String> allEHPTags = TagMetadataStore.getAllTagList();

        Map<String, Map<String, Double>> groupedTagMap = TagMetadataStore.getGroupedTagMap();
        log.info("allEHPTags : {}\nsize : {}",  allEHPTags, allEHPTags.size());
        log.info("groupedTagMap keys : {}\nsize : {}",  groupedTagMap.keySet(), groupedTagMap.keySet().size());

        processTagsInChunks(allEHPTags, TAG_CHUNK_SIZE);

        if ("CHUNK".equals(readStrategy)) {
            return processTagsInChunksRead(allEHPTags, groupedTagMap);
        } else {
            return processTagsBatchRead(allEHPTags, groupedTagMap);
        }
    }

    private Map<String, Map<String, Double>> processTagsInChunksRead(
            List<String> allEHPTags,
            Map<String, Map<String, Double>> groupedTagMap) {

        for (int i = 0; i < allEHPTags.size(); i += TAG_CHUNK_SIZE) {
            int endIndex = Math.min(i + TAG_CHUNK_SIZE, allEHPTags.size());
            List<String> chunk = allEHPTags.subList(i, endIndex);

            log.info("청크 읽기 처리 중: {}/{} (크기: {})",
                    i + chunk.size(), allEHPTags.size(), chunk.size());

            ResponseEntity<String> res = tagClientService.testReadTags(chunk);
            if (!res.getStatusCode().is2xxSuccessful()) {
                throw new IllegalStateException("testReadTags 실패: " + res.getStatusCode().value());
            } else {
                log.info("testReadTags 성공: " + res.getStatusCode().value());
            }

            updateGroupedTagMap(res.getBody(), groupedTagMap);
        }

        return groupedTagMap;
    }

    private Map<String, Map<String, Double>> processTagsBatchRead(
            List<String> allEHPTags,
            Map<String, Map<String, Double>> groupedTagMap) {

        // readTags 한꺼번에 호출
        ResponseEntity<String> res = tagClientService.testReadTags(allEHPTags);
        if (!res.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException("testReadTags 실패: " + res.getStatusCode().value());
        } else {
            log.info("testReadTags 성공: " + res.getStatusCode().value());
        }

        updateGroupedTagMap(res.getBody(), groupedTagMap);
        return groupedTagMap;
    }

    private void updateGroupedTagMap(String response, Map<String, Map<String, Double>> groupedTagMap) {
        try {
            // response(HTTP) → dto 파싱 후
            TagResponseDTO dto = objectMapper.readValue(response, TagResponseDTO.class);

            // 1) TAG 응답을 tagName → Double 값으로 변환 {태그 : 값}
            Map<String, Double> valueByTag = new HashMap<>();
            for (TagData td : dto.tags()) {
                String t = td.tagName();
                String v = td.currentValue();
                if (t == null) continue;
                Double d = tryParseDouble(v); // 숫자 아니면 null
                valueByTag.put(t, d);
            }

            // 2) groupedTagMap 갱신: 내부 맵의 키(태그)가 응답에 있으면 값만 업데이트
            for (Map.Entry<String, Map<String, Double>> e : groupedTagMap.entrySet()) {
                Map<String, Double> tags = e.getValue();
                for (Map.Entry<String, Double> te : tags.entrySet()) {
                    String tag = te.getKey();
                    Double newVal = valueByTag.get(tag);
                    if (newVal != null || valueByTag.containsKey(tag)) {
                        tags.put(tag, newVal);
                    }
                }
            }

        } catch (JsonProcessingException e) {
            throw new IllegalStateException("응답 데이터 파싱 실패: " + e.getMessage());
        }
    }

    private TagResponseDTO readTagsInChunks(List<String> allTagNamesToFetch) {
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        List<TagData> allTags = new ArrayList<>();
        long lastTimestamp = 0L;
        int totalCount = 0;

        for (int i = 0; i < allTagNamesToFetch.size(); i += TAG_CHUNK_SIZE) {
            int endIndex = Math.min(i + TAG_CHUNK_SIZE, allTagNamesToFetch.size());
            List<String> chunk = allTagNamesToFetch.subList(i, endIndex);

            log.info("[{}] 태그 청크 읽기 처리 중: {}/{} (크기: {})",
                    requestId, i + chunk.size(), allTagNamesToFetch.size(), chunk.size());

            TagResponseDTO chunkResponse = restTemplate.postForObject(
                    baseUrl + "/?ReadTags",
                    chunk,
                    TagResponseDTO.class
            );

            if (chunkResponse != null && chunkResponse.tags() != null) {
                allTags.addAll(chunkResponse.tags());
                totalCount += chunkResponse.tagCnt();
            }
        }

        return new TagResponseDTO(totalCount, lastTimestamp, allTags);
    }

    /**
     * 문자열을 Double로 변환 시도. 실패하면 null 반환.
     * @param s 변환할 문자열
     * @return 변환된 Double 값 또는 null
     */
    private static Double tryParseDouble(String s) {
        if (s == null) return null;
        String t = s.trim();
        if (t.isEmpty()) return null;
        try { return Double.valueOf(t); }
        catch (NumberFormatException e) { return null; }
    }

    /**
     * 리스트를 지정된 크기의 청크로 분할.
     * @param list 분할할 리스트
     * @param partitionSize 청크 크기
     * @return 분할된 리스트의 리스트
     */
    private List<List<String>> partitionList(List<String> list, int partitionSize) {
        List<List<String>> partitions = new ArrayList<>();
        for (int i = 0; i < list.size(); i += partitionSize) {
            partitions.add(list.subList(i, Math.min(i + partitionSize, list.size())));
        }
        return partitions;
    }

    /**
     * 태그 목록을 청크로 나누어 API에 추가하고 결과를 검증.
     * @param tagNames 추가할 태그 이름 목록
     * @param chunkSize 청크 크기
     * @return 추가된 태그 수의 합계
     */
    private int processTagsInChunks(List<String> tagNames, int chunkSize) {
        List<List<String>> chunks = partitionList(tagNames, chunkSize);
        int totalAdded = 0;

        for (List<String> chunk : chunks) {
            ResponseEntity<String> res = tagClientService.addTags(chunk);
            try {
                JsonNode node = objectMapper.readTree(res.getBody());
                int cnt = node.get("AddTags").asInt();
                if (cnt != chunk.size()) {
                    throw new IllegalStateException("addTags 실패: " + res.getStatusCode().value() +
                            ", expected: " + chunk.size() + ", actual: " + cnt);
                }
                totalAdded += cnt;
                log.info("addTags chunk size: {}, response status: {}", chunk.size(), res.getStatusCode());
            } catch (JsonProcessingException e) {
                throw new IllegalStateException("응답 데이터 파싱 실패: " + e.getMessage());
            }
        }
        return totalAdded;
    }

}
