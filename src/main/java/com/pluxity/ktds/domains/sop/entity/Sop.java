package com.pluxity.ktds.domains.sop.entity;

import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
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

    @Column(name = "sop_category")
    private String sopCategory;
    @Column(name = "sop_name")
    private String sopName;
    @Column(name = "sop_description")
    private String sopDescription;
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
    public Sop(String sopCategory, String sopName, String sopDescription, String mainManagerDivision, String mainManagerName, String mainManagerContact, String subManagerDivision, String subManagerName, String subManagerContact) {
        this.sopCategory = sopCategory;
        this.sopName = sopName;
        this.sopDescription = sopDescription;
        this.mainManagerDivision = mainManagerDivision;
        this.mainManagerName = mainManagerName;
        this.mainManagerContact = mainManagerContact;
        this.subManagerDivision = subManagerDivision;
        this.subManagerName = subManagerName;
        this.subManagerContact = subManagerContact;
    }
    public void updateSopFile(FileInfo sopFile) {
        this.sopFile = sopFile;
    }
}
