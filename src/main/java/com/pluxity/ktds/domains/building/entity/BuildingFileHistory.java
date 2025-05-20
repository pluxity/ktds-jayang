package com.pluxity.ktds.domains.building.entity;

import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "building_file_history")
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class BuildingFileHistory {
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

    @Column(name = "reg_dt")
    private String regDt;

    @Builder
    public BuildingFileHistory(@NotNull Building building, @NotNull FileInfo fileInfo, String historyContent, String buildingVersion, String regUser, String regDt) {
        this.building = building;
        this.fileInfo = fileInfo;
        this.historyContent = historyContent;
        this.buildingVersion = buildingVersion;
        this.regUser = regUser;
        this.regDt = regDt;
    }
}
