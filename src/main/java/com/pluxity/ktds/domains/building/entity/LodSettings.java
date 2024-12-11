package com.pluxity.ktds.domains.building.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class LodSettings {
    @Column(name = "lod_max_distance")
    private Double lodMaxDistance;

    @Column(name = "lod_count")
    private Long lodCount;

    @Column(name = "lod_data", columnDefinition = "LONGTEXT")
    private String lodData;

    @Builder
    public LodSettings(Double lodMaxDistance, Long lodCount, String lodData) {
        this.lodMaxDistance = lodMaxDistance;
        this.lodCount = lodCount;
        this.lodData = lodData;
    }
}
