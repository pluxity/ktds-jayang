package com.pluxity.ktds.domains.poi_set.dto;


import com.pluxity.ktds.domains.plx_file.constant.FileEntityType;
import com.pluxity.ktds.domains.plx_file.starategy.SaveStrategy;
import lombok.Builder;
import org.springframework.web.multipart.MultipartFile;

@Builder
public record IconSetFileRequestDTO(
    MultipartFile file,
    FileEntityType type,
    SaveStrategy strategy
) {
}
