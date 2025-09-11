package com.pluxity.ktds.domains.notice.entity;

import com.pluxity.ktds.domains.building.entity.Building;
import com.pluxity.ktds.domains.building.entity.Floor;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.poi_set.entity.IconSet;
import com.pluxity.ktds.global.auditing.AuditableEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "notice")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notice extends AuditableEntity {

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "content")
    private String content;

    @Column(name = "is_urgent")
    private Boolean isUrgent;

    @Column(name = "is_active")
    private Boolean isActive;
    @Column(name = "is_read")
    private Boolean isRead;
    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @ElementCollection
    @CollectionTable(name = "notice_building", joinColumns = @JoinColumn(name = "notice_id"))
    @Column(name = "building_id")
    private List<Long> buildingIds = new ArrayList<>();


    @Builder
    public Notice(String title, String content, Boolean isUrgent, Boolean isActive, Boolean isRead, LocalDateTime expiredAt, List<Long> buildingIds) {
        this.title = title;
        this.content = content;
        this.isUrgent = isUrgent;
        this.isActive = isActive;
        this.isRead = isRead;
        this.expiredAt = expiredAt;
        if (buildingIds != null) {
            this.buildingIds = buildingIds;
        }
    }

    public void update(String title, String content, Boolean isUrgent, Boolean isActive, Boolean isRead, LocalDateTime expiredAt, List<Long> buildingIds) {
        this.title = title;
        this.content = content;
        this.isUrgent = isUrgent;
        this.isActive = isActive;
        this.isRead = isRead;
        this.expiredAt = expiredAt;
        this.buildingIds.clear();
        if (buildingIds != null) {
            this.buildingIds.addAll(buildingIds);
        }
    }

    public void updateRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public void updateActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
