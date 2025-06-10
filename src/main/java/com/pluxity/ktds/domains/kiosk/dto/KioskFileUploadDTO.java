package com.pluxity.ktds.domains.kiosk.dto;

import com.pluxity.ktds.domains.plx_file.constant.FileEntityType;
import lombok.Builder;
import org.springframework.web.multipart.MultipartFile;

@Builder
public record KioskFileUploadDTO(
        MultipartFile file,
        FileEntityType type
) {}
