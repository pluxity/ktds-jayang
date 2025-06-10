package com.pluxity.ktds.domains.building.entity;

import com.pluxity.ktds.domains.building.dto.BuildingResponseDTO;
import com.pluxity.ktds.domains.building.dto.SbmFloorDTO;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Optional;

@Entity
@Getter
@Table(name = "sbm_floor")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SbmFloor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_id")
    private Floor floor;

    @Column(name = "sbm_floor_id", nullable = false, length = 10)
    private String sbmFloorId;
    @Column(name = "sbm_file_name", nullable = false, length = 50)
    private String sbmFileName;
    @Column(name = "sbm_floor_base", nullable = false)
    private String sbmFloorBase;
    @Column(name = "sbm_floor_group", nullable = false, length = 3)
    private String sbmFloorGroup;
    @Column(name = "sbm_floor_name", nullable = false, length = 50)
    private String sbmFloorName;
    @Column(name = "sbm_is_main", nullable = false, length = 5)
    private String isMain;

    @Builder
    public SbmFloor(Floor floor, String sbmFloorId, String sbmFileName, String sbmFloorBase, String sbmFloorGroup, String sbmFloorName, String isMain) {
        this.floor = floor;
        this.sbmFloorId = sbmFloorId;
        this.sbmFileName = sbmFileName;
        this.sbmFloorBase = sbmFloorBase;
        this.sbmFloorGroup = sbmFloorGroup;
        this.sbmFloorName = sbmFloorName;
        this.isMain = isMain;
    }

    public void changeFloor(Floor floor) {
        this.floor = floor;
    }

    public void update(SbmFloor sbmFloor) {
        this.sbmFloorId = validationValue("sbmFloorId", sbmFloor.sbmFloorId);
        this.sbmFileName = validationValue("sbmFileName", sbmFloor.sbmFileName);
        this.sbmFloorBase = validationValue("sbmFloorBase", sbmFloor.sbmFloorBase);
        this.sbmFloorGroup = validationValue("sbmFloorGroup", sbmFloor.sbmFloorGroup);
        this.sbmFloorName = validationValue("sbmFloorName", sbmFloor.sbmFloorName);
        this.isMain = validationValue("isMain", sbmFloor.isMain);
    }

    private String validationValue(String fieldName, String value) {
        return Optional.ofNullable(value)
                .filter(sf -> !sf.isEmpty())
                .orElseThrow(() -> new CustomException(ErrorCode.EMPTY_VALUE_XML_FIELD, fieldName));
    }

    public SbmFloorDTO toResponseDTO() {
        return SbmFloorDTO.builder()
                .id(this.id)
                .sbmFloorId(this.sbmFloorId)
                .sbmFileName(this.sbmFileName)
                .sbmFloorBase(this.sbmFloorBase)
                .sbmFloorGroup(this.sbmFloorGroup)
                .sbmFloorName(this.sbmFloorName)
                .isMain(this.isMain)
                .build();
    }
}