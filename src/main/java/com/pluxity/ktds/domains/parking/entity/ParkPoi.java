package com.pluxity.ktds.domains.parking.entity;

import com.pluxity.ktds.domains.building.entity.Building;
import com.pluxity.ktds.domains.building.entity.Spatial;
import com.pluxity.ktds.domains.kiosk.entity.KioskCategory;
import com.pluxity.ktds.domains.parking.dto.ParkPoiResponseDTO;
import com.pluxity.ktds.domains.parking.enums.ParkPoiType;
import com.pluxity.ktds.domains.parking.enums.ParkSideType;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "park_poi")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class ParkPoi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id")
    private Building building;

    @Column
    private Integer floorNo;

    @Column
    private String floorNm;

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

    @Column(name = "latitude")
    private Long latitude;

    @Column(name = "longitude")
    private Long longitude;

    @Column(name = "park_poi_name")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "park_poi_type")
    private ParkPoiType poiType;

    @Enumerated(EnumType.STRING)
    @Column(name = "park_side_type")
    private ParkSideType parkSideType;

    public ParkPoiResponseDTO toResponseDTO() {
        return ParkPoiResponseDTO.builder()
                .id(this.id)
                .buildingId(this.building.getId())
                .floorNo(this.floorNo)
                .floorNm(this.floorNm)
                .name(this.name)
                .position(this.position)
                .rotation(this.rotation)
                .scale(this.scale)
                .latitude(this.latitude)
                .longitude(this.longitude)
                .poiType(this.poiType)
                .parkSideType(this.parkSideType)
                .build();

    }
}
