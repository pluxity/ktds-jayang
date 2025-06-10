package com.pluxity.ktds.domains.plx_file.entity;

import com.pluxity.ktds.domains.building.dto.FileInfoDTO;
import com.pluxity.ktds.domains.plx_file.constant.FileEntityType;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "file_info")
@Getter
public class FileInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "origin_name", nullable = false, length = 100)
    private String originName;

    @Column(name = "extension", nullable = false, length = 20)
    private String extension;

    @Column(name = "directory_name", nullable = false)
    private String directoryName;

    @Column(name = "stored_name", nullable = false, length = 100)
    private String storedName;

    @Column(name = "file_entity_type", nullable = false, length = 20)
    private String fileEntityType;

    @Builder
    public FileInfo(String originName, String extension, String directoryName, String storedName, String fileEntityType) {
        this.originName = originName;
        this.extension = extension;
        this.directoryName = directoryName;
        this.storedName = storedName;
        this.fileEntityType = fileEntityType;
    }

    public FileInfoDTO toDto() {
        return FileInfoDTO.builder()
                .id(id)
                .originName(originName)
                .extension(extension)
                .directory(directoryName)
                .storedName(storedName)
                .fileEntityType(fileEntityType)
                .build();
    }

    public void changeFileEntityType(FileEntityType type) {
        if (type == null || type.getType() == null) {
            throw new CustomException(ErrorCode.INVALID_FILE_ENTITY_TYPE);
        }
        this.fileEntityType = type.getType();
    }
}
