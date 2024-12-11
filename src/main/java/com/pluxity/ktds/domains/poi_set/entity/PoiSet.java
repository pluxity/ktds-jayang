package com.pluxity.ktds.domains.poi_set.entity;

import com.pluxity.ktds.domains.poi_set.dto.PoiCategorySummaryDTO;
import com.pluxity.ktds.domains.poi_set.dto.PoiSetResponseDTO;
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
@Table(name = "poi_set")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PoiSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String name;


    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(
            name = "poi_set_poi_category",
            joinColumns = @JoinColumn(name = "poi_set_id"),
            inverseJoinColumns = @JoinColumn(name = "poi_category_id")
    )
    private final List<PoiCategory> poiCategories = new ArrayList<>();

    @Builder
    public PoiSet(String name) {
        this.name = name;
    }

    public void updateName(String name) {
        this.name = name;
    }

    public void updatePoiCategories(@NotNull List<PoiCategory> poiCategories) {
        List<PoiCategory> newPoiCategories = new ArrayList<>(poiCategories);
        this.poiCategories.clear();
        this.poiCategories.addAll(newPoiCategories);
    }

    public PoiSetResponseDTO toDto() {
        return PoiSetResponseDTO
                .builder()
                .id(id)
                .name(name)
                .poiCategories(poiCategories.stream()
                        .map(this::poiCategoryMapper)
                        .toList())
                .build();
    }

    private PoiCategorySummaryDTO poiCategoryMapper(PoiCategory poiCategory) {
        return PoiCategorySummaryDTO.builder()
                .id(poiCategory.getId())
                .imageFile(poiCategory.getImageFile())
                .name(poiCategory.getName())
                .build();
    }

}
