package com.pluxity.ktds.domains.poi_set.entity;

import com.pluxity.ktds.domains.plx_file.constant.FileEntityType;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.poi_set.dto.IconSetResponseDTO;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "icon_set")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class IconSet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_info_id_2d")
    private FileInfo iconFile2D;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_info_id_3d")
    private FileInfo iconFile3D;

    @Column(name = "name", nullable = false, length = 20)
    private String name;

    @Builder
    public IconSet(String name) {
        this.name = name;
    }

    public void updateFileInfo2D(@NotNull FileInfo fileInfo2D) {
        if (!fileInfo2D.getFileEntityType().equals(FileEntityType.ICON2D.getType())) {
            throw new CustomException(ErrorCode.INVALID_FILE_ENTITY_TYPE, fileInfo2D.getFileEntityType());
        }
        this.iconFile2D = fileInfo2D;
    }

    public void updateFileInfo3D(@NotNull FileInfo fileInfo3D) {
        if (!fileInfo3D.getFileEntityType().equals(FileEntityType.ICON3D.getType())) {
            throw new CustomException(ErrorCode.INVALID_FILE_ENTITY_TYPE, fileInfo3D.getFileEntityType());
        }
        this.iconFile3D = fileInfo3D;
    }

    public void updateName(@NotNull String name) {
        this.name = name;
    }

    public IconSetResponseDTO toDto() {
        return IconSetResponseDTO.builder()
                .id(id)
                .name(name)
                .iconFile2D(iconFile2D.toDto())
                .iconFile3D(iconFile3D.toDto())
                .build();
    }

}
