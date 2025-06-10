package com.pluxity.ktds.domains.poi_set.entity;

import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.poi_set.dto.IconSetResponseDTO;
import com.pluxity.ktds.domains.poi_set.dto.PoiMiddleCategoryResponseDTO;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_info_id")
    private FileInfo imageFile;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "poi_category_icon_set",
            joinColumns = @JoinColumn(name = "poi_middle_category_id"),
            inverseJoinColumns = @JoinColumn(name = "icon_set_id")
    )
    private final List<IconSet> iconSets = new ArrayList<>();

    public PoiMiddleCategoryResponseDTO toDto() {
        return PoiMiddleCategoryResponseDTO.builder()
                .id(id)
                .name(name)
                .poiCategory(poiCategory.toDto())
                .imageFile(imageFile)
                .iconSets(iconSets.stream()
                        .map(this::iconSetMapper)
                        .toList()
                )
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


    public void updateImageFile(@NotNull FileInfo fileInfo) {
        this.imageFile = fileInfo;
    }

    public void updateIconSets(@NotNull List<IconSet> iconSets) {
        ArrayList<IconSet> newIconSets = new ArrayList<>(iconSets);
        this.iconSets.clear();
        this.iconSets.addAll(newIconSets);
    }

    private IconSetResponseDTO iconSetMapper(@NotNull IconSet iconSet) {
        return IconSetResponseDTO.builder()
                .id(iconSet.getId())
                .name(iconSet.getName())
                .iconFile2D(iconSet.getIconFile2D() != null ? iconSet.getIconFile2D().toDto() : null)
                .iconFile3D(iconSet.getIconFile3D() != null ? iconSet.getIconFile3D().toDto() : null)
                .build();
    }
}
