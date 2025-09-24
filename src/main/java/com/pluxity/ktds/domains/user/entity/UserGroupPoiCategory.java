package com.pluxity.ktds.domains.user.entity;

import com.pluxity.ktds.domains.poi_set.entity.PoiCategory;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Table(name = "user_group_poi_category")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserGroupPoiCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_group_id", nullable = false)
    private UserGroup userGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poi_category_id", nullable = false)
    private PoiCategory poiCategory;

    @Column(name = "can_read")
    private Boolean canRead;

    @Column(name = "can_write")
    private Boolean canWrite;

    @Column(name = "registered_by", length = 20)
    private String registeredBy;

    @Builder
    public UserGroupPoiCategory(UserGroup userGroup, PoiCategory poiCategory,
                                Boolean canRead, Boolean canWrite,
                                String registeredBy) {
        this.userGroup = userGroup;
        this.poiCategory = poiCategory;
        this.canRead = canRead;
        this.canWrite = canWrite;
        this.registeredBy = registeredBy;
    }
}
