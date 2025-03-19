package com.pluxity.ktds.domains.building.entity;

import com.pluxity.ktds.domains.building.dto.PoiDetailResponseDTO;
import com.pluxity.ktds.domains.building.dto.PoiResponseDTO;
import com.pluxity.ktds.domains.event.entity.Alarm;
import com.pluxity.ktds.domains.poi_set.entity.IconSet;
import com.pluxity.ktds.domains.poi_set.entity.PoiCategory;
import com.pluxity.ktds.domains.poi_set.entity.PoiMiddleCategory;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Cascade;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Entity
@Getter
@Table(name = "poi")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Poi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id")
    private Building building;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_id")
    private Floor floor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poi_category_id")
    private PoiCategory poiCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poi_middle_category_id")
    private PoiMiddleCategory poiMiddleCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "icon_set_id")
    private IconSet iconSet;

    @Embedded
    @AttributeOverride(name = "x", column = @Column(name = "position_x"))
    @AttributeOverride(name = "y", column = @Column(name = "position_y"))
    @AttributeOverride(name = "z", column = @Column(name = "position_z"))
    private Spatial position;

    @Embedded
    @AttributeOverride(name = "x", column = @Column(name = "rotation_x"))
    @AttributeOverride(name = "y", column = @Column(name = "rotation_y"))
    @AttributeOverride(name = "z", column = @Column(name = "rotation_z"))
    private Spatial rotation;

    @Embedded
    @AttributeOverride(name = "x", column = @Column(name = "scale_x"))
    @AttributeOverride(name = "y", column = @Column(name = "scale_y"))
    @AttributeOverride(name = "z", column = @Column(name = "scale_z"))
    private Spatial scale;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "code", nullable = false, length = 20)
    private String code;

    @ElementCollection
    @CollectionTable(name = "poi_tags", joinColumns = @JoinColumn(name = "poi_id"))
    @Column(name = "tag_names")
    private List<String> tagNames = new ArrayList<>();

    @Builder
    public Poi(String name, String code, List<String> tagNames) {
        this.name = name;
        this.code = code;
        this.tagNames = tagNames != null ? new ArrayList<>(tagNames) : new ArrayList<>();
    }

    public void update(String name, String code, List<String> tagNames) {
        if (StringUtils.hasText(name)) {
            this.name = name;
        }
        if (StringUtils.hasText(code)) {
            this.code = code;
        }
        if (tagNames != null) {
            this.tagNames.clear();
            this.tagNames.addAll(tagNames);
        }
    }

    public void changeTags(List<String> tagNames) {
        this.tagNames.clear();
        this.tagNames.addAll(tagNames);
        this.tagNames = new ArrayList<>(tagNames);
    }

    public void changeBuilding(Building building) {
        this.building = building;
    }

    public void changeFloor(Floor floor) {
        this.floor = floor;
    }

    public void changePoiCategory(PoiCategory poiCategory) {
        this.poiCategory = poiCategory;
    }
    public void changePoiMiddleCategory(PoiMiddleCategory poiMiddleCategory) {
        this.poiMiddleCategory = poiMiddleCategory;
    }

    public void changeIconSet(IconSet iconSet) {
        this.iconSet = iconSet;
    }

    public void changePosition(Spatial position) {
        this.position = position;
    }

    public void changeRotation(Spatial rotation) {
        this.rotation = rotation;
    }

    public void changeScale(Spatial scale) {
        this.scale = scale;
    }

    public PoiDetailResponseDTO toDetailResponseDTO() {
        return PoiDetailResponseDTO.builder()
                .id(this.getId())
                .buildingId(this.getBuilding().getId())
                .floorId(this.getFloor().getId())
                .poiCategoryId(this.getPoiCategory().getId())
                .poiMiddleCategoryId(Optional.ofNullable(this.getPoiMiddleCategory())
                        .map(PoiMiddleCategory::getId)
                        .orElse(null))
                .iconSetId(this.getIconSet().getId())
                .position(this.getPosition())
                .rotation(this.getRotation())
                .scale(this.getScale())
                .name(this.getName())
                .code(this.getCode())
                .tagNames(this.getTagNames())
                .build();
    }

    public PoiResponseDTO toResponseDTO() {
        return PoiResponseDTO.builder()
                .id(this.id)
                .name(this.name)
                .code(this.code)
                .build();
    }
}
