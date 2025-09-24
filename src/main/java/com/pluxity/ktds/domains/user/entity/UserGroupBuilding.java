package com.pluxity.ktds.domains.user.entity;

import com.pluxity.ktds.domains.building.entity.Building;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "user_group_building")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserGroupBuilding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_group_id", nullable = false)
    private UserGroup userGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;

    @Column(name = "can_read")
    private Boolean canRead;

    @Column(name = "can_write")
    private Boolean canWrite;

    @Column(name = "registered_by", length = 20)
    private String registeredBy;

    @Builder
    public UserGroupBuilding(UserGroup userGroup, Building building,
                             Boolean canRead, Boolean canWrite,
                             String registeredBy) {
        this.userGroup = userGroup;
        this.building = building;
        this.canRead = canRead;
        this.canWrite = canWrite;
        this.registeredBy = registeredBy;
    }
}
