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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_info_id")
    private FileInfo imageFile;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "poi_category_icon_set",
            joinColumns = @JoinColumn(name = "poi_category_id"),
            inverseJoinColumns = @JoinColumn(name = "icon_set_id")
    )
    private final List<IconSet> iconSets = new ArrayList<>();

    @Builder
    public PoiCategory(String name) {
        this.name = name;
    }


    public void updateName(@NotNull String name) {
        this.name = name;
    }

    public void updateImageFile(@NotNull FileInfo fileInfo) {
        this.imageFile = fileInfo;
    }

    public void updateIconSets(@NotNull List<IconSet> iconSets) {
        ArrayList<IconSet> newIconSets = new ArrayList<>(iconSets);
        this.iconSets.clear();
        this.iconSets.addAll(newIconSets);
    }

    public PoiCategoryResponseDTO toDto() {
        return PoiCategoryResponseDTO.builder()
                .id(id)
                .name(name)
                .imageFile(imageFile)
                .iconSets(iconSets.stream()
                        .map(this::iconSetMapper)
                        .toList()
                )
                .build();
    }

    private IconSetResponseDTO iconSetMapper(@NotNull IconSet iconSet) {
        return IconSetResponseDTO.builder()
                .id(iconSet.getId())
                .name(name)
                .iconFile2D(iconSet.getIconFile2D().toDto())
                .iconFile3D(iconSet.getIconFile3D().toDto())
                .build();
    }
}
