package com.pluxity.ktds.domains.poi_set.entity;

import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.poi_set.dto.IconSetResponseDTO;
import com.pluxity.ktds.domains.poi_set.dto.PoiCategoryResponseDTO;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "poi_category")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PoiCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 20)
    private String name;


    @Builder
    public PoiCategory(String name) {
        this.name = name;
    }


    public void updateName(@NotNull String name) {
        this.name = name;
    }

    public PoiCategoryResponseDTO toDto() {
        return PoiCategoryResponseDTO.builder()
                .id(id)
                .name(name)
                .build();
    }
}
