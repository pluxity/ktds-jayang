package com.pluxity.ktds.domains.building.entity;

import com.pluxity.ktds.domains.building.dto.HistoryResponseDTO;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.global.auditing.AuditableEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "building_file_history")
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class BuildingFileHistory extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id")
    private Building building;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "file_info_id")
    private FileInfo fileInfo;

    @Column(name = "building_version")
    private String buildingVersion;

    @Column(name = "history_content")
    private String historyContent;

    @Column(name = "reg_user")
    private String regUser;

    @Builder
    public BuildingFileHistory(@NotNull Building building, @NotNull FileInfo fileInfo, String historyContent, String buildingVersion, String regUser) {
        this.building = building;
        this.fileInfo = fileInfo;
        this.historyContent = historyContent;
        this.buildingVersion = buildingVersion;
        this.regUser = regUser;
    }

    public HistoryResponseDTO toHistoryResponseDTO() {
        return HistoryResponseDTO.builder()
                .historyId(this.id)
                .buildingId(this.building.getId())
                .fileId(this.fileInfo.getId())
                .buildingVersion(this.buildingVersion)
                .historyContent(this.historyContent)
                .createdAt(this.getCreatedAt())
                .regUser(this.getRegUser())
                .fileName(this.fileInfo.getOriginName())
                .build();
    }

    public void updateBuildingVersion(String version) {
        this.buildingVersion = version;
    }
}
