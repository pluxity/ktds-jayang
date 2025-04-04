package com.pluxity.ktds.domains.cctv.entity;

import com.pluxity.ktds.domains.building.entity.Poi;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "poi_cctv")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Setter
public class PoiCctv {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poi_id", nullable = false)
    private Poi poi;

    @Column(name = "code", nullable = false)
    private String code;

    @Column(name = "is_main", nullable = false)
    private String isMain;

    @Builder
    public PoiCctv(Poi poi, String code, String isMain) {
        this.poi = poi;
        this.code = code;
        this.isMain = isMain;
    }
}
