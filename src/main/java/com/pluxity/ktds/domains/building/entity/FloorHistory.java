package com.pluxity.ktds.domains.building.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class FloorHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "floor_id")
    private Floor floor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_file_history_id")
    private BuildingFileHistory buildingFileHistory;

    @Builder
    public FloorHistory(Floor floor, BuildingFileHistory buildingFileHistory) {
        this.floor = floor;
        this.buildingFileHistory = buildingFileHistory;
    }


}
