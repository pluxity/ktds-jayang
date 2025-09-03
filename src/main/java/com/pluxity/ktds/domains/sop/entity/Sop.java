package com.pluxity.ktds.domains.sop.entity;

import com.pluxity.ktds.domains.plx_file.constant.FileEntityType;
import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.sop.dto.SopResponseDTO;
import com.pluxity.ktds.domains.sop.dto.UpdateSopDTO;
import com.pluxity.ktds.global.constant.ErrorCode;
import com.pluxity.ktds.global.exception.CustomException;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "sop")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Sop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sop_name")
    private String sopName;
    @Column(name = "main_mngr_division")
    private String mainManagerDivision;
    @Column(name = "main_mngr_name")
    private String mainManagerName;
    @Column(name = "main_mngr_contact")
    private String mainManagerContact;
    @Column(name = "sub_mngr_division")
    private String subManagerDivision;
    @Column(name = "sub_mngr_name")
    private String subManagerName;
    @Column(name = "sub_mngr_contact")
    private String subManagerContact;
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sop_file_id")
    private FileInfo sopFile;

    @Builder
    public Sop(String sopName, String mainManagerDivision, String mainManagerName, String mainManagerContact, String subManagerDivision, String subManagerName, String subManagerContact) {
        this.sopName = sopName;
        this.mainManagerDivision = mainManagerDivision;
        this.mainManagerName = mainManagerName;
        this.mainManagerContact = mainManagerContact;
        this.subManagerDivision = subManagerDivision;
        this.subManagerName = subManagerName;
        this.subManagerContact = subManagerContact;
    }
    public void updateSopFile(FileInfo sopFile) {
        if (!sopFile.getFileEntityType().equals(FileEntityType.ICON2D.getType())) {
            throw new CustomException(ErrorCode.INVALID_FILE_ENTITY_TYPE, sopFile.getFileEntityType());
        }
        this.sopFile = sopFile;
    }

    public void updateSop(UpdateSopDTO dto) {
        this.sopName = dto.sopName();
        this.mainManagerDivision = dto.mainManagerDivision();
        this.mainManagerName = dto.mainManagerName();
        this.mainManagerContact = dto.mainManagerContact();
        this.subManagerDivision = dto.subManagerDivision();
        this.subManagerName = dto.subManagerName();
        this.subManagerContact = dto.subManagerContact();
    }

    public SopResponseDTO toResponseDTO() {
        return SopResponseDTO.builder()
                .id(this.id)
                .sopName(this.sopName)
                .mainManagerDivision(this.mainManagerDivision)
                .mainManagerName(this.mainManagerName)
                .mainManagerContact(this.mainManagerContact)
                .subManagerDivision(this.subManagerDivision)
                .subManagerName(this.subManagerName)
                .subManagerContact(this.subManagerContact)
                .sopFile(sopFile != null ? sopFile.toDto() : null)
                .build();
    }
}
