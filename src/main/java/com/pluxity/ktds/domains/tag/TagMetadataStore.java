package com.pluxity.ktds.domains.tag;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Component;

import java.io.FileInputStream;
import java.io.InputStream;
import java.util.*;

@Component
@Slf4j
public class TagMetadataStore {

    private static final Map<String, Map<String, Double>> groupedTagMap = new LinkedHashMap<>();

    private static final List<String> allTagList = new ArrayList<>();

    public void loadFromClasspath(String classpathExcelPath) {
        Map<String, Map<String, Double>> result = new LinkedHashMap<>();
        List<String> tagList = new ArrayList<>();

        try (InputStream is = getClass().getResourceAsStream(classpathExcelPath);
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String tagName = getCellValue(row.getCell(0));
                String tagDesc = getCellValue(row.getCell(1));
                if (tagName == null || tagName.isBlank()) continue;

                tagList.add(tagName);
                result.computeIfAbsent(tagDesc, k -> new LinkedHashMap<>())
                        .put(tagName, null);
            }

            groupedTagMap.clear();
            groupedTagMap.putAll(result);

            allTagList.clear();
            allTagList.addAll(tagList);

            log.info("태그 메타데이터 로딩 완료. 그룹 수: {}", groupedTagMap.size());

        } catch (Exception e) {
            log.error("엑셀 로딩 실패: {}", classpathExcelPath, e);
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    public static Map<String, Map<String, Double>> getGroupedTagMap() {
        return groupedTagMap;
    }

    public static List<String> getAllTagList() {
        return Collections.unmodifiableList(allTagList);
    }

    public static Map<String, Double> getTagsByEquipment(String equipName) {
        return groupedTagMap.getOrDefault(equipName, Collections.emptyMap());
    }

    public static void updateTagValue(String equipName, String tagName, Double value) {
        Map<String, Double> tags = groupedTagMap.get(equipName);
        if (tags != null && tags.containsKey(tagName)) {
            tags.put(tagName, value);
        } else {
            log.warn("updateTagValue 실패 - 존재하지 않는 키: equip='{}', tag='{}'", equipName, tagName);
        }
    }

    public static Set<String> getAllEquipments() {
        return groupedTagMap.keySet();
    }

    public static void clear() {
        groupedTagMap.clear();
        allTagList.clear();
    }
}
