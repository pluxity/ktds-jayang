package com.pluxity.ktds.domains.building.dto;

public record CreateBuildingHistoryDTO(
        Long buildingId,
        String historyContent,
        Long fileInfoId,
        String version
) {
}
