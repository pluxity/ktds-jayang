package com.pluxity.ktds.domains.tag;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.building.entity.PoiTag;
import com.pluxity.ktds.domains.building.repostiory.PoiRepository;
import com.pluxity.ktds.domains.building.repostiory.PoiTagRepository;
import com.pluxity.ktds.domains.tag.dto.TagData;
import com.pluxity.ktds.domains.tag.dto.TagResponseDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    public Map<Long, TagResponseDTO> processElevTagDataByPoi(String type, Long buildingId, String buildingName) {

        boolean isAllBuilding = (buildingId == null || buildingName == null);
        List<Poi> pois = poiRepository.findByBuildingIdAndMiddleCategoryName(buildingId, "승강기");

        Map<Long, TagResponseDTO> poiTagResponseMap = new HashMap<>();
        List<String> allTagNamesToFetch = new ArrayList<>();
        Map<String, Long> tagNamePoiIdMap = new HashMap<>();

        for (Poi poi : pois) {
            Long poiId = poi.getId();
            String buildingNm = poi.getBuilding().getName();
            String mappedBuilding = ("A".equals(buildingNm) || "B".equals(buildingNm)) ? buildingNm : "C";
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

        if (!allTagNamesToFetch.isEmpty()) {
            String tagNamesParam = String.join(",", allTagNamesToFetch);
//            ResponseEntity<String> addRes = tagClientService.addTags(allTagNamesToFetch);
//            if (!addRes.getStatusCode().is2xxSuccessful()) {
//                throw new IllegalStateException("addTags 실패: " + addRes.getStatusCodeValue());
//            }

            TagResponseDTO all = restTemplate.postForObject(
                    baseUrl + "/?ReadTags",
                    allTagNamesToFetch,
                    TagResponseDTO.class
            );

            if (all != null && all.tags() != null) {
                Map<Long, List<TagData>> groupedTagData = all.tags().stream()
                        .filter(td -> tagNamePoiIdMap.containsKey(td.tagName()))
                        .collect(Collectors.groupingBy(td -> tagNamePoiIdMap.get(td.tagName())));

                for (Map.Entry<Long, List<TagData>> poiEntry : groupedTagData.entrySet()) {
                    Long poiId = poiEntry.getKey();
                    List<TagData> result = new ArrayList<>();
                    List<TagData> tagsForPoi = poiEntry.getValue();

                    for (TagData td : tagsForPoi) {
                        String full = td.tagName();
                        String raw = td.currentValue();
                        String enumName = full.substring(full.lastIndexOf('-') + 1);
                        String desc = null;
                        try {
                            if (type.equals("ELEV")) {
                                // ELEV
                                if ("A".equals(buildingName) || "B".equals(buildingName)) {
                                    // A, B
                                    desc = ElevatorTagManager.ElevatorABTag.valueOf(enumName).getValueDescription(raw);
                                } else {
                                    // C
                                    desc = ElevatorTagManager.ElevatorCTag.fromTagName(enumName).getValueDescription(raw);
                                }
                            } else {
                                // ESCL(C)
                                desc = ElevatorTagManager.EscalatorTag.valueOf(enumName).getValueDescription(raw);
                            }
                        } catch (IllegalArgumentException e) {
                            e.printStackTrace();
                            desc = raw;
                        }
                        result.add(new TagData(full, desc, td.tagStatus(), td.alarmStatus()));
                    }
                    if (!result.isEmpty()) {
                        poiTagResponseMap.put(poiId, new TagResponseDTO(result.size(), all.timestamp(), result));
                    }
                }
            }
        }
        return poiTagResponseMap;
    }

    public Map<Long, TagResponseDTO> processEsclTagDataByPoi(String type) {

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

        if (!allTagNamesToFetch.isEmpty()) {
            String tagNamesParam = String.join(",", allTagNamesToFetch);

//            ResponseEntity<String> addRes = tagClientService.addTags(allTagNamesToFetch);
//            if (!addRes.getStatusCode().is2xxSuccessful()) {
//                throw new IllegalStateException("addTags 실패: " + addRes.getStatusCodeValue());
//            }

            TagResponseDTO all = restTemplate.postForObject(
                    baseUrl + "/?ReadTags",
                    allTagNamesToFetch,
                    TagResponseDTO.class
            );

            if (all != null && all.tags() != null) {
                Map<Long, List<TagData>> groupedTagData = all.tags().stream()
                        .filter(td -> tagNamePoiIdMap.containsKey(td.tagName()))
                        .collect(Collectors.groupingBy(td -> tagNamePoiIdMap.get(td.tagName())));

                for (Map.Entry<Long, List<TagData>> poiEntry : groupedTagData.entrySet()) {
                    Long poiId = poiEntry.getKey();
                    List<TagData> result = new ArrayList<>();
                    List<TagData> tagsForPoi = poiEntry.getValue();

                    for (TagData td : tagsForPoi) {
                        String full = td.tagName();
                        String raw = td.currentValue();
                        String enumName = full.substring(full.lastIndexOf('-') + 1);
                        String desc = null;
                        if (type.equals("ESCL")) {
                            desc = ElevatorTagManager.EscalatorTag.valueOf(enumName).getValueDescription(raw);
                        }
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
                        poiTagResponseMap.put(poiId, new TagResponseDTO(result.size(), all.timestamp(), result));
                    }
                }
            }
        }
        System.out.println("poiTagResponseMap : " + poiTagResponseMap);
        return poiTagResponseMap;
    }

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
    public String addAllElevatorTags() {
        List<String> tagNames = poiTagRepository.findByTagNameContaining("-EV-")
                .stream().map(PoiTag::getTagName).toList();
        ResponseEntity<String> resp = tagClientService.addTags(tagNames);
        return resp.getBody();
    }

    public TagResponseDTO processAirConditionerTags() {

        List<String> allEHPTags = TagMetadataStore.getAllTagList();

        Map<String, Map<String, Double>> groupedTagMap = TagMetadataStore.getGroupedTagMap();
        log.info("allEHPTags : {}\nsize : {}",  allEHPTags, allEHPTags.size());
        log.info("groupedTagMap keys : {}\nsize : {}",  groupedTagMap.keySet(), groupedTagMap.keySet().size());
        ResponseEntity<String> addRes = tagClientService.addTags(allEHPTags);
        if (!addRes.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException("addTags 실패: " + addRes.getStatusCode().value());
        }

        ResponseEntity<String> response = tagClientService.testReadTags(allEHPTags);

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
}
