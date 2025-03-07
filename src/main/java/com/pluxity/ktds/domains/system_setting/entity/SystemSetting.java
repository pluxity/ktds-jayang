package com.pluxity.ktds.domains.system_setting.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import com.pluxity.ktds.domains.system_setting.dto.SystemSettingResponseDTO;

import java.time.LocalDate;


@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SystemSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "poi_line_length", nullable = false)
    private float poiLineLength;

    @Column(name = "poi_icon_size_ratio", nullable = false)
    private float poiIconSizeRatio;

    @Column(name = "poi_text_size_ratio", nullable = false)
    private float poiTextSizeRatio;

    @Column(name = "node_default_color", nullable = false)
    private String nodeDefaultColor;

    @Builder
    public SystemSetting(Long id, float poiLineLength, float poiIconSizeRatio, float poiTextSizeRatio, String nodeDefaultColor) {
        this.id = id;
        this.poiLineLength = poiLineLength;
        this.poiIconSizeRatio = poiIconSizeRatio;
        this.poiTextSizeRatio = poiTextSizeRatio;
        this.nodeDefaultColor = nodeDefaultColor;
    }

    public void update(float poiLineLength, float poiIconSizeRatio, float poiTextSizeRatio, String nodeDefaultColor) {
        this.poiLineLength = poiLineLength;
        this.poiIconSizeRatio = poiIconSizeRatio;
        this.poiTextSizeRatio = poiTextSizeRatio;
        this.nodeDefaultColor = nodeDefaultColor;
    }

    public SystemSettingResponseDTO toDto(){
        return SystemSettingResponseDTO.builder()
                .id(id)
                .nodeDefaultColor(nodeDefaultColor)
                .poiIconSizeRatio(poiIconSizeRatio)
                .poiTextSizeRatio(poiTextSizeRatio)
                .poiLineLength(poiLineLength)
                .build();
    }

}
