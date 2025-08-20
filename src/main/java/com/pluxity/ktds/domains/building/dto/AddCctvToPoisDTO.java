package com.pluxity.ktds.domains.building.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record AddCctvToPoisDTO(
        Long buildingId, // 빌딩 ID
        Integer floorNo, // 층 번호
        Long cctvPoiId,        // CCTV인 POI의 ID
        List<Long> targetPoiIds // CCTV를 추가할 주변 POI들의 ID 목록
) {
}