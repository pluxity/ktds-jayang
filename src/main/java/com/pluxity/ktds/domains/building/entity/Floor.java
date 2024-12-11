package com.pluxity.ktds.domains.building.entity;

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
@Table(name = "floor")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Floor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id")
    private Building building;

    @OneToMany(mappedBy = "floor", cascade = CascadeType.ALL)
    private List<SbmFloor> sbmFloors = new ArrayList<>();


    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Builder
    public Floor(String name, @NotNull List<SbmFloor> sbmFloors) {
        this.name = name;
        this.sbmFloors = sbmFloors;
    }

    public void changeBuilding(@NotNull Building building) {
        this.building = building;
    }

    public void changeName(@NotNull String name) {
        this.name = name;
    }

    public void update(@NotNull Floor floor) {
        this.name = floor.name;
    }

    public void addSbmFloor(@NotNull SbmFloor sbmFloor) {
        sbmFloors.add(sbmFloor);
    }

    public void addSbmFloors(@NotNull List<SbmFloor> sbmFloorsInGroup) {
        if (this.sbmFloors != null) {
            sbmFloors.addAll(sbmFloorsInGroup);
        }
    }
}
