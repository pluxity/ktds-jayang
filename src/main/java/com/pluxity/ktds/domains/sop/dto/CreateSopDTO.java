package com.pluxity.ktds.domains.sop.dto;

import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import lombok.Builder;

@Builder
public record CreateSopDTO(
        Long id,
        String sopName,
        String mainManagerDivision,
        String mainManagerName,
        String mainManagerContact,
        String subManagerDivision,
        String subManagerName,
        String subManagerContact,
        Long sopFileId
) {
}
