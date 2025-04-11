package com.pluxity.ktds.domains.kiosk.entity;

import com.pluxity.ktds.domains.building.entity.Building;
import com.pluxity.ktds.domains.building.entity.Floor;
import com.pluxity.ktds.domains.building.entity.Spatial;
import com.pluxity.ktds.domains.kiosk.dto.KioskAllPoiResponseDTO;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import com.pluxity.ktds.domains.kiosk.dto.KioskPoiDetailResponseDTO;
import com.pluxity.ktds.domains.kiosk.dto.StorePoiDetailResponseDTO;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "kiosk_poi")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class KioskPoi {

    @Builder
    public KioskPoi(String name, String phoneNumber, KioskCategory category, String kioskCode, String description,
                    boolean isKiosk) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.category = category;
        this.kioskCode = kioskCode;
        this.description = description;
        this.isKiosk = isKiosk;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id")
    private Building building;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_id")
    private Floor floor;

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

    @Column(name = "kiosk_name", nullable = false, length = 50)
    private String name;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "kiosk_logo_id")
    private FileInfo logo;

    @Column(name = "phone_number", nullable = true, length = 50)
    private String phoneNumber;

    @Column(name = "kiosk_code", nullable = true, length = 50)
    private String kioskCode;

    @Column(name = "description", nullable = true, length = 200)
    private String description;

    @Column(name = "is_kiosk", nullable = false)
    private boolean isKiosk; // true: 키오스크, false: 상가

    @Enumerated(EnumType.STRING)
    @Column(name = "kiosk_category", nullable = false)
    private KioskCategory category;

    @OneToMany(mappedBy = "kioskPoi", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("priority ASC")// 우선순위 기준 정렬
    private List<Banner> banners;

    // 배너 추가 (4개만)
    public void addBanner(Banner banner) {
        if (banners.size() >= 4) {
            throw new CustomException(ErrorCode.MAX_BANNER_LIMIT);
        }
        banners.add(banner);
        banner.addKioskPoi(this);
    }

    public void changeLogo(FileInfo logo) {
        this.logo = logo;
    }

    public void changeBuilding(Building building) {
        this.building = building;
    }

    public void changeFloor(Floor floor) {
        this.floor = floor;
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

    public void storePoiUpdate(String name, KioskCategory category, String phoneNumber){
        if(name != null) {
            this.name = name;
        }
        if(category != null) {
            this.category = category;
        }
        if(phoneNumber != null) {
            this.phoneNumber = phoneNumber;
        }
        if(this.category != null) {
            this.category = category;
        }
    }

    public void kioskPoiUpdate(String name, String kioskCode, String description) {
        if(name != null) {
            this.name = name;
        }
        if(kioskCode != null) {
            this.kioskCode = kioskCode;
        }
        if(description != null) {
            this.description = description;
        }
    }

    public void clearBanners() {
        banners.clear();
    }

    public KioskPoiDetailResponseDTO toKioskDetailResponseDTO() {
        return KioskPoiDetailResponseDTO.builder()
                .id(this.id)
                .isKiosk(this.isKiosk)
                .name(this.name)
                .kioskCode(this.kioskCode)
                .description(this.description)
                .position(this.position)
                .rotation(this.rotation)
                .scale(this.scale)
                .build();
    }

    public StorePoiDetailResponseDTO toStoreDetailResponseDTO() {
        return StorePoiDetailResponseDTO.builder()
                .id(this.id)
                .isKiosk(this.isKiosk)
                .name(this.name)
                .category(this.category)
                .floorId(this.floor.getId())
                .phoneNumber(this.phoneNumber)
                .logo(this.logo.getId())
                .banners(this.banners.stream().map(Banner::toDetailResponseDTO).toList())
                .position(this.position)
                .rotation(this.rotation)
                .scale(this.scale)
                .build();
    }

    public KioskAllPoiResponseDTO toAllResponseDto() {
        return KioskAllPoiResponseDTO.builder()
                .id(this.id)
                .name(this.name)
                .isKiosk(this.isKiosk)
                .build();
    }
}
