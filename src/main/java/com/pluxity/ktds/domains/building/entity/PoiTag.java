package com.pluxity.ktds.domains.building.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "poi_tag")
@NoArgsConstructor
@Getter
public class PoiTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poi_id")
    private Poi poi;

    @Column(name = "tag_name", nullable = false)
    private String tagName;

    @Column(name = "external_registered")
    private Boolean externalRegistered = false;

    @Builder
    public PoiTag(String tagName) {
        this.tagName = tagName;
        this.externalRegistered = false;
    }

    public void markAsRegistered() {
        this.externalRegistered = true;
    }

    /**
     * 연관관계 편의 메서드 - POI 변경
     */
    public void changePoi(Poi poi) {
        if (this.poi != null) {
            this.poi.getPoiTags().remove(this);
        }
        this.poi = poi;
    }

    /**
     * 연관관계 제거 편의 메서드
     */
    public void removePoi() {
        if (this.poi != null) {
            this.poi.getPoiTags().remove(this);
            this.poi = null;
        }
    }

    public String getNormalizedTag() {
        int hit = tagName.indexOf("-LI-RE-");
        if (hit < 0) return tagName;

        int cut = tagName.lastIndexOf('-');
        if (cut < 0) return tagName;

        return tagName.substring(0, cut).stripTrailing();
    }

}
