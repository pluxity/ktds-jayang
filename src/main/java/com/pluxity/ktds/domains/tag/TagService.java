package com.pluxity.ktds.domains.tag;

import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.building.repostiory.PoiRepository;
import com.pluxity.ktds.domains.tag.dto.TagData;
import com.pluxity.ktds.domains.tag.dto.TagResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagService {

    private final PoiRepository poiRepository;
    private final RestTemplate restTemplate;

    public Map<Long, TagResponseDTO> processElevTagDataByPoi(String type, Long buildingId, String buildingName) {

//        String mappedBuilding = (buildingName.equals("A") || buildingName.equals("B")) ? buildingName : "C";
//
//        String prefix = type.equals("ELEV")
//                ? String.format("%s-null-EV-ELEV-", mappedBuilding)
//                : String.format("%s-null-EV-ESCL-", mappedBuilding);
        List<Poi> pois;
        boolean isAllBuilding = (buildingId == null || buildingName == null);
        if (isAllBuilding) {
            pois = poiRepository.findByCategoryName("승강기");
        } else {
            pois = poiRepository.findPoisByBuildingId(buildingId);
        }

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
            TagResponseDTO all = restTemplate.getForObject(
                    "http://localhost:9999/api/tags/data",
                    TagResponseDTO.class,
                    tagNamesParam
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
        System.out.println("poiTagResponseMap : " + poiTagResponseMap);
        return poiTagResponseMap;
    }

    public Map<Long, TagResponseDTO> processEsclTagDataByPoi(String type) {

        String prefix = "C-null-EV-ESCL-";
//        List<Poi> pois = poiRepository.findPoisByBuildingId(buildingId);

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
            TagResponseDTO all = restTemplate.getForObject(
                    "http://localhost:9999/api/tags/data",
                    TagResponseDTO.class,
                    tagNamesParam
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

}
