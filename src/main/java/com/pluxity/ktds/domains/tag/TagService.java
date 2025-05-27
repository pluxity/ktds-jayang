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

    public Map<Long, TagResponseDTO> processTagDataByPoi(String type, Long buildingId, String buildingName) {

        System.out.println("type : " + type);
        String prefixEv = String.format("%s-null-EV-ELEV-", buildingName);
        String prefixEs = String.format("%s-null-EV-ESCL-", buildingName);
        List<Poi> pois = poiRepository.findPoisByBuildingId(buildingId);
        Map<Long, TagResponseDTO> poiTagResponseMap = new HashMap<>();
        List<String> allTagNamesToFetch = new ArrayList<>();
        Map<String, Long> tagNamePoiIdMap = new HashMap<>();

        for (Poi poi : pois) {
            Long poiId = poi.getId();
            List<String> tagNamesList = poi.getTagNames();
            if (tagNamesList != null) {
                for (String tagName : tagNamesList) {
                    String[] parts = tagName.split("-");
                    if (parts.length > 2 && parts[2].equalsIgnoreCase(type)) {
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

                        if (full.startsWith(prefixEv)) {
                            try {
                                if (type.equals("EV")) {
                                    if ("A".equals(buildingName) || "B".equals(buildingName)) {
                                        desc = ElevatorTagManager.ElevatorABTag.valueOf(enumName).getValueDescription(raw);
                                    } else {
                                        desc = ElevatorTagManager.ElevatorCTag.fromTagName(enumName).getValueDescription(raw);
                                    }
                                } else {

                                }
                                result.add(new TagData(full, desc, td.tagStatus(), td.alarmStatus()));
                            } catch (IllegalArgumentException e) {
                                e.printStackTrace();
                                result.add(new TagData(full, raw, td.tagStatus(), td.alarmStatus()));
                            }
                        } else if (full.startsWith(prefixEs)) {
                            try {
                                desc = ElevatorTagManager.EscalatorTag.valueOf(enumName).getValueDescription(raw);
                                result.add(new TagData(full, desc, td.tagStatus(), td.alarmStatus()));
                            } catch (IllegalArgumentException e) {
                                result.add(new TagData(full, raw, td.tagStatus(), td.alarmStatus()));
                            }
                        }
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
