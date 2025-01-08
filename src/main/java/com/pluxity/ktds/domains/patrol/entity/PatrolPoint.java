package com.pluxity.ktds.domains.patrol.entity;

import com.pluxity.ktds.domains.building.entity.Floor;
import com.pluxity.ktds.domains.building.entity.Poi;
import com.pluxity.ktds.domains.patrol.dto.PatrolPointResponseDTO;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;

@Entity
@Getter
@Table(name = "patrol_point")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PatrolPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patrol_id", nullable = false)
    private Patrol patrol;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_id", nullable = false)
    private Floor floor;

    @Column(name = "name", nullable = false, length = 20)
    private String name;

    @Column(name = "sort_order", nullable = false, length = 10)
    private Integer sortOrder;

    @Embedded
    @AttributeOverride(name = "x", column = @Column(name = "x"))
    @AttributeOverride(name = "y", column = @Column(name = "y"))
    @AttributeOverride(name = "z", column = @Column(name = "z"))
    private Spatial point;

    @Builder
    public PatrolPoint(String name, Integer sortOrder, Spatial point) {
        this.name = name;
        this.sortOrder = sortOrder;
        this.point = point;
    }

    public void changePatrol(@NotNull Patrol patrol) {
        this.patrol = patrol;
    }

    public void updateName(@NotNull String name) {
        this.name = name;
    }

    public void changeSortOrder(@NotNull int sortOrder) {
        this.sortOrder = sortOrder;
    }

    public void changeFloor(@NotNull Floor floor) {
        this.floor = floor;
        this.name = floor.getName();
    }

    public PatrolPointResponseDTO toResponseDTO() {
        return PatrolPointResponseDTO.builder()
                .id(id)
                .floorId(floor.getId())
                .sortOrder(sortOrder)
                .name(name)
                .build();
    }
}
