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

    @Builder
    public BuildingFileHistory(@NotNull Building building, @NotNull FileInfo fileInfo) {
        this.building = building;
        this.fileInfo = fileInfo;
    }
}
