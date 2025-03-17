package com.pluxity.ktds.domains.poi_set.entity;

import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.poi_set.dto.PoiCategoryResponseDTO;
import com.pluxity.ktds.domains.poi_set.dto.PoiMiddleCategoryResponseDTO;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "poi_middle_category",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"name", "poi_category_id"})
})
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PoiMiddleCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 20)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poi_category_id")
    private PoiCategory poiCategory;

    public PoiMiddleCategoryResponseDTO toDto() {
        return PoiMiddleCategoryResponseDTO.builder()
                .id(id)
                .name(name)
                .poiCategory(poiCategory.toDto())
                .build();
    }
    @Builder
    public PoiMiddleCategory(String name, PoiCategory poiCategory) {
        this.name = name;
        this.poiCategory = poiCategory;
    }
    public void updateName(String name) {
        this.name = name;
    }

    public void updatePoiCategory(PoiCategory poiCategory) {
        this.poiCategory = poiCategory;
    }
}
