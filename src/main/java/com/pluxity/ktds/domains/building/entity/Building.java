package com.pluxity.ktds.domains.building.entity;

import com.pluxity.ktds.domains.building.dto.BuildingDetailResponseDTO;
import com.pluxity.ktds.domains.building.dto.BuildingResponseDTO;
import com.pluxity.ktds.domains.building.dto.UpdateBuildingDTO;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
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

    @Embedded
    private LodSettings lodSettings;

    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code;

    @Column(name = "name", nullable = false, length = 20)
    private String name;

    @Column(name = "description", nullable = false, length = 200)
    private String description;

    @Column(name = "evacuation_route", columnDefinition = "LONGTEXT")
    private String evacuationRoute;

    @Column(name = "topology", columnDefinition = "LONGTEXT")
    private String topology;

    @Column(name = "is_indoor", nullable = false)
    private String isIndoor;

    @Column(name = "camera_2d", columnDefinition = "LONGTEXT")
    private String camera2d;

    @Builder
    public Building(String code, String name, String description, String isIndoor) {
        this.code = code;
        this.name = name;
        this.isIndoor = isIndoor;
        this.description = description;
    }

    public void update(@NotNull UpdateBuildingDTO other) {
        if (!this.code.equals(other.code())) {
            throw new CustomException(ErrorCode.INVALID_CODE);
        }
        this.name = validString(other.name()) ? other.name() : this.name;
        this.isIndoor = validString(other.isIndoor()) ? other.isIndoor() : this.isIndoor;
        this.description = validString(other.description()) ? other.description() : this.description;

    }
    public void changeCamera2d(String camera2d) {
        this.camera2d = camera2d;
    }

    public void changeEvacuationRoute(String evacuationRoute) {
        this.evacuationRoute = evacuationRoute;
    }

    public void changeLodSettings(@NotNull LodSettings lodSettings) {
        this.lodSettings = lodSettings;
    }
    public void changeIsIndoor(@NotNull String isIndoor) {
        this.isIndoor = isIndoor;
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
                .isIndoor(this.isIndoor)
                .description(this.description)
                .camera2d(this.camera2d)
                .build();
    }

    public BuildingDetailResponseDTO toDetailResponseDTO() {
        return BuildingDetailResponseDTO.builder()
                .id(this.id)
                .code(this.code)
                .name(this.name)
                .description(this.description)
                .lodSettings(this.lodSettings)
                .evacuationRoute(this.evacuationRoute)
                .topology(this.topology)
                .floors(this.getFloors().stream().map(Floor::toResponseDto).toList())
                .buildingFile(this.fileInfo == null ? null : this.fileInfo.toDto())
                .floorIds(this.floors.stream().map(Floor::getId).toList())
                .isIndoor(this.isIndoor)
                .camera2d(this.camera2d)
                .build();

    }

}
