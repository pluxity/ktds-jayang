package com.pluxity.ktds.domains.management.entity;

import com.pluxity.ktds.domains.management.dto.MaintenanceResponseDTO;
import com.pluxity.ktds.global.auditing.AuditableEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "maintenance")
public class Maintenance extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "management_category")
    private String managementCategory;

    @Column(name = "management_name")
    private String maintenanceName;
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
    @Column(name = "modifier")
    private String modifier;

    @Builder
    public Maintenance(String managementCategory, String maintenanceName, String mainManagerDivision, String mainManagerName, String mainManagerContact, String subManagerDivision, String subManagerName, String subManagerContact, String modifier) {
        this.managementCategory = managementCategory;
        this.maintenanceName = maintenanceName;
        this.mainManagerDivision = mainManagerDivision;
        this.mainManagerName = mainManagerName;
        this.mainManagerContact = mainManagerContact;
        this.subManagerDivision = subManagerDivision;
        this.subManagerName = subManagerName;
        this.subManagerContact = subManagerContact;
        this.modifier = modifier;
    }

    public MaintenanceResponseDTO toResponseDTO() {
        return MaintenanceResponseDTO.builder()
                .id(this.id)
                .managementCategory(this.managementCategory)
                .maintenanceName(this.maintenanceName)
                .mainManagerDivision(this.mainManagerDivision)
                .mainManagerName(this.mainManagerName)
                .mainManagerContact(this.mainManagerContact)
                .subManagerDivision(this.subManagerDivision)
                .subManagerName(this.subManagerName)
                .subManagerContact(this.subManagerContact)
                .modifier(this.modifier)
                .build();
    }

    public void updateMaintenance(String managementCategory, String maintenanceName, String mainManagerDivision, String mainManagerName, String mainManagerContact, String subManagerDivision, String subManagerName, String subManagerContact, String modifier) {
        this.managementCategory = managementCategory;
        this.maintenanceName = maintenanceName;
        this.mainManagerDivision = mainManagerDivision;
        this.mainManagerName = mainManagerName;
        this.mainManagerContact = mainManagerContact;
        this.subManagerDivision = subManagerDivision;
        this.subManagerName = subManagerName;
        this.subManagerContact = subManagerContact;
        this.modifier = modifier;
    }
}
