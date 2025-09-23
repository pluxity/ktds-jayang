package com.pluxity.ktds.domains.building.entity;

import com.pluxity.ktds.domains.building.dto.PoiAlarmDetailDTO;
import com.pluxity.ktds.domains.building.dto.PoiDetailResponseDTO;
import com.pluxity.ktds.domains.building.dto.PoiPagingResponseDTO;
import com.pluxity.ktds.domains.building.dto.PoiResponseDTO;
import com.pluxity.ktds.domains.cctv.dto.PoiCctvDTO;
import com.pluxity.ktds.domains.cctv.entity.PoiCctv;
import com.pluxity.ktds.domains.poi_set.entity.IconSet;
import com.pluxity.ktds.domains.poi_set.entity.PoiCategory;
import com.pluxity.ktds.domains.poi_set.entity.PoiMiddleCategory;
import com.pluxity.ktds.domains.sop.dto.SopResponseDTO;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Entity
@Getter
@Table(name = "poi")
@FilterDef(
        name = "poiCategoryPermissionFilter",
        parameters = @ParamDef(name = "permittedCategoryIds", type = Long.class)
)
@Filter(
        name = "poiCategoryPermissionFilter",
        condition = "poi_category_id in (:permittedCategoryIds)"
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Poi {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id")
    private Building building;

    @Column
    private Integer floorNo;

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

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "code", nullable = false)
    private String code;

    @OneToMany(mappedBy = "poi", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PoiTag> poiTags = new ArrayList<>();

    @OneToMany(mappedBy = "poi", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PoiCctv> poiCctvs = new ArrayList<>();

    @Column(name = "is_light")
    private Boolean isLight;

    @Column(name = "light_group")
    private String lightGroup;

    @Column(name = "camera_ip")
    private String cameraIp;

    @Column(name = "camera_id")
    private String cameraId;

    @Builder
    public Poi(String name, String code, Boolean isLight, String lightGroup, String cameraIp, String cameraId) {
        this.name = name;
        this.code = code;
        this.isLight = isLight;
        this.lightGroup = lightGroup;
        this.cameraIp = cameraIp;
        this.cameraId = cameraId;
    }

    public void update(String name, String code, List<PoiCctv> poiCctvs, Boolean isLight, String lightGroup, String cameraIp, String cameraId) {
        if (StringUtils.hasText(name)) {
            this.name = name;
        }
        if (StringUtils.hasText(code)) {
            this.code = code;
        }
        if (poiCctvs != null) {
            this.poiCctvs.clear();
            this.poiCctvs.addAll(poiCctvs);
        }
        if (isLight != null) {
            this.isLight = isLight;
        }
        if (lightGroup != null) {
            this.lightGroup = lightGroup;
        }
        if (cameraIp != null) {
            this.cameraIp = cameraIp;
        }
        this.cameraId = cameraId;
    }

    public void changeBuilding(Building building) {
        this.building = building;
    }

    public void changeFloorNo(Integer floorNo) {
        this.floorNo = floorNo;
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
    public void changeIsLight(Boolean isLight) {
        this.isLight = isLight;
    }
    public void changeLightGroup(String lightGroup) {
        this.lightGroup = lightGroup;
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

    public void updateCameraId(String cameraId) {
        this.cameraId = cameraId;
    }

    public void updatePoiTags(List<String> newTagNames) {
        if(newTagNames == null) {
            this.poiTags.clear();
            return;
        }

        List<String> existingTagNames = this.poiTags.stream()
                .map(PoiTag::getTagName)
                .toList();

        // 기존에 있지만 새로운 리스트에 없는 태그 제거
        this.poiTags.removeIf(tag -> !newTagNames.contains(tag.getTagName()));

        // 새로운 리스트에 있지만 기존에 없는 태그들 추가
        for (String tagName : newTagNames) {
            if (!existingTagNames.contains(tagName)) {
                PoiTag poiTag = new PoiTag(tagName);
                poiTag.changePoi(this);  // 연관관계 설정
            }
        }
    }

    public PoiDetailResponseDTO toDetailResponseDTO() {
        return PoiDetailResponseDTO.builder()
                .id(this.getId())
                .buildingId(this.getBuilding().getId())
                .floorNo(this.getFloorNo())
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
                .cctvList(this.poiCctvs.stream()
                        .map(cctv -> PoiCctvDTO.builder()
                                .id(cctv.getId())
                                .cctvName(cctv.getCctvName())
                                .isMain(cctv.getIsMain())
                                .build())
                        .toList())
                .isLight(this.getIsLight())
                .lightGroup(this.getLightGroup())
                .cameraIp(this.getCameraIp())
                .cameraId(this.getCameraId())
                .build();
    }

    public PoiAlarmDetailDTO toPoiAlarmDetailDTO(List<PoiCctvDTO> cctvList, SopResponseDTO sopResponseDTO) {
        return PoiAlarmDetailDTO.builder()
                .id(this.getId())
                .buildingId(this.getBuilding().getId())
                .floorNo(this.getFloorNo())
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
                .cctvList(cctvList)
                .isLight(this.getIsLight())
                .lightGroup(this.getLightGroup())
                .cameraIp(this.getCameraIp())
                .cameraId(this.getCameraId())
                .sop(sopResponseDTO)
                .build();
    }

    public PoiPagingResponseDTO toPoiPagingDTO(List<PoiCctvDTO> cctvList, List<String> tagNames) {
        return PoiPagingResponseDTO.builder()
                .id(this.getId())
                .buildingId(this.getBuilding().getId())
                .floorNo(this.getFloorNo())
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
                .tagNames(tagNames)
                .cctvList(cctvList)
                .isLight(this.getIsLight())
                .lightGroup(this.getLightGroup())
                .cameraIp(this.getCameraIp())
                .cameraId(this.getCameraId())
                .build();
    }

    public List<String> getTagNames() {
        return poiTags.stream()
                .map(PoiTag::getTagName)
                .collect(Collectors.toList());
    }

    public PoiResponseDTO toResponseDTO() {
        return PoiResponseDTO.builder()
                .id(this.id)
                .name(this.name)
                .code(this.code)
                .isLight(isLight)
                .lightGroup(this.lightGroup)
                .cameraIp(this.cameraIp)
                .cameraId(this.cameraId)
                .build();
    }
}
