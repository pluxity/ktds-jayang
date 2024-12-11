package com.pluxity.ktds.domains.building.entity;

import com.pluxity.ktds.domains.building.dto.BuildingDetailResponseDTO;
import com.pluxity.ktds.domains.building.dto.BuildingResponseDTO;
import com.pluxity.ktds.domains.building.dto.UpdateBuildingDTO;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.poi_set.entity.PoiSet;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

import static com.pluxity.ktds.global.utils.PxUtil.validString;

@Entity
@Getter
@Table(name = "building")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_info_id")
    private FileInfo fileInfo;

    @OneToMany(mappedBy = "building", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<Floor> floors = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "poi_set_id")
    private PoiSet poiSet;

    @Embedded
    private LodSettings lodSettings;

    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code;

    @Column(name = "name", nullable = false, length = 20)
    private String name;

    @Column(name = "description", nullable = false, length = 200)
    private String description;

    @Column(name = "topology", columnDefinition = "LONGTEXT")
    private String topology;

    @Builder
    public Building(String code, String name, String description) {
        this.code = code;
        this.name = name;
        this.description = description;
    }

    public void update(@NotNull UpdateBuildingDTO other) {
        if (!this.code.equals(other.code())) {
            throw new CustomException(ErrorCode.INVALID_CODE);
        }
        this.name = validString(other.name()) ? other.name() : this.name;
        this.description = validString(other.description()) ? other.description() : this.description;


    }

    public void changePoiSet(@NotNull PoiSet poiSet) {
        this.poiSet = poiSet;
    }

    public void changeLodSettings(@NotNull LodSettings lodSettings) {
        this.lodSettings = lodSettings;
    }

    public void changeTopology(@NotNull String topology) {
        this.topology = topology;
    }

    public void changeFileInfo(@NotNull FileInfo fileInfo) {
        this.fileInfo = fileInfo;
    }

    public void addFloor(@NotNull Floor floor) {
        this.floors.add(floor);
        floor.changeBuilding(this);
    }

    public void removeFloor(@NotNull Floor floor) {
        this.floors.remove(floor);
        floor.changeBuilding(null);
    }

    public void removeFloors() {
        this.floors.clear();
    }

    public BuildingResponseDTO toResponseDTO() {
        return BuildingResponseDTO.builder()
                .id(this.id)
                .code(this.code)
                .name(this.name)
                .description(this.description)
                .build();
    }

    public BuildingDetailResponseDTO toDetailResponseDTO() {
        return BuildingDetailResponseDTO.builder()
                .id(this.id)
                .code(this.code)
                .name(this.name)
                .description(this.description)
                .lodSettings(this.lodSettings)
                .topology(this.topology)
                .buildingFile(this.fileInfo == null ? null : this.fileInfo.toDto())
                .floorIds(this.floors.stream().map(Floor::getId).toList())
                .poiSetId(this.poiSet.getId())
                .build();

    }

}
