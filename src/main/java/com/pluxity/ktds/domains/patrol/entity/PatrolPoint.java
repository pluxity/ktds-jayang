package com.pluxity.ktds.domains.patrol.entity;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.List;

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

    @Column
    private Integer floorNo;

    @Column(name = "name", nullable = false, length = 20)
    private String name;

    @Column(name = "sort_order", nullable = false, length = 10)
    private Integer sortOrder;

    @Embedded
    @AttributeOverride(name = "x", column = @Column(name = "x"))
    @AttributeOverride(name = "y", column = @Column(name = "y"))
    @AttributeOverride(name = "z", column = @Column(name = "z"))
    private Spatial point;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "patrol_point_and_poi",
            joinColumns = @JoinColumn(name = "patrol_point_id"),
            inverseJoinColumns = @JoinColumn(name = "poi_id")
    )
    private final List<Poi> pois = new ArrayList<>();

    @Builder
    public PatrolPoint(String name, Integer sortOrder, Spatial point, Integer floorNo) {
        this.name = name;
        this.sortOrder = sortOrder;
        this.point = point;
        this.floorNo = floorNo;
    }

    public void changePatrol(@NotNull Patrol patrol) {
        this.patrol = patrol;
    }

    public void updateName(@NotNull String name) {
        this.name = name;
    }

    public void updatePois(@NotNull List<Poi> pois) {
        this.pois.clear();
        this.pois.addAll(pois);
    }

    public void changeSortOrder(@NotNull int sortOrder) {
        this.sortOrder = sortOrder;
    }


    public PatrolPointResponseDTO toResponseDTO() {
        return PatrolPointResponseDTO.builder()
                .id(id)
                .floorNo(floorNo)
                .sortOrder(sortOrder)
                .name(name)
                .pointLocation(convertPointToString(point))
                .pois(pois.size() > 0 ? pois.stream().map(Poi::getId).toList() : new ArrayList<>())
                .build();
    }

    private String convertPointToString(Object point) {
        if (point != null) {
            try {
                ObjectMapper objectMapper = new ObjectMapper();
                return objectMapper.writeValueAsString(point);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return null;
    }
}
