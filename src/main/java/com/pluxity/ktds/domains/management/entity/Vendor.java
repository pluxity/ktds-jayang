package com.pluxity.ktds.domains.management.entity;

import com.pluxity.ktds.domains.management.dto.CreateVendorDTO;
import com.pluxity.ktds.domains.management.dto.VendorResponseDTO;
import com.pluxity.ktds.global.auditing.AuditableEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "vendor")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Vendor extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vendor_name")
    private String vendorName;
    @Column(name = "representative_name")
    private String representativeName;
    @Column(name = "business_number")
    private String businessNumber;
    @Column(name = "contact_number")
    private String contactNumber;
    @Column(name = "description")
    private String description;
    @Column(name = "modifier")
    private String modifier;

    @Builder
    public Vendor(String vendorName, String representativeName, String businessNumber, String contactNumber, String description, String modifier) {
        this.vendorName = vendorName;
        this.representativeName = representativeName;
        this.businessNumber = businessNumber;
        this.contactNumber = contactNumber;
        this.description = description;
        this.modifier = modifier;
    }

    public VendorResponseDTO toResponseDTO() {
        return VendorResponseDTO.builder()
                .id(this.id)
                .vendorName(this.vendorName)
                .representativeName(this.representativeName)
                .businessNumber(this.businessNumber)
                .contactNumber(this.contactNumber)
                .description(this.description)
                .modifier(this.modifier)
                .build();
    }

    public void updateVendor(String vendorName, String representativeName, String businessNumber, String contactNumber, String description, String modifier) {
        this.vendorName = vendorName;
        this.representativeName = representativeName;
        this.businessNumber = businessNumber;
        this.contactNumber = contactNumber;
        this.description = description;
        this.modifier = modifier;
    }
}
