package com.pluxity.ktds.domains.patrol.entity;

import com.pluxity.ktds.domains.building.entity.Building;
import com.pluxity.ktds.domains.patrol.dto.PatrolResponseDTO;
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
@Table(name = "patrol")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Patrol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id")
    private Building building;

    @Column(name = "name", nullable = false, length = 30, unique = true)
    private String name;

    @OneToMany(mappedBy = "patrol", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<PatrolPoint> patrolPoints = new ArrayList<>();

    @Builder
    public Patrol(String name) {
        this.name = name;
    }

    public void changeBuilding(@NotNull Building building) {
        this.building = building;
    }

    public void update(String name) {
        this.name = name;
    }

    public void addPatrolPoint(@NotNull PatrolPoint patrolPoint) {
        this.patrolPoints.add(patrolPoint);
    }

    public void removePatrolPoint(PatrolPoint patrolPoint) {
        this.patrolPoints.remove(patrolPoint);
        patrolPoint.changePatrol(null);
    }

}
