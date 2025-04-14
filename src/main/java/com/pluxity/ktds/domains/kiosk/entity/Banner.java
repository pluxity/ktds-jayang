package com.pluxity.ktds.domains.kiosk.entity;

import com.pluxity.ktds.domains.plx_file.entity.FileInfo;
import com.pluxity.ktds.domains.kiosk.dto.BannerDetailResponseDTO;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "kiosk_banner")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Banner {

    @Builder
    public Banner(KioskPoi kioskPoi, FileInfo image, int priority, boolean isPermanent, LocalDate startDate, LocalDate endDate) {
        this.kioskPoi = kioskPoi;
        this.image = image;
        this.priority = priority;
        this.isPermanent = isPermanent;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kiosk_id")
    private KioskPoi kioskPoi;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "file_info_id")
    private FileInfo image;

    @Column(name = "priority", nullable = false)
    private int priority;

    @Column(name = "is_permanent", nullable = false)
    private boolean isPermanent;

    @Column(name = "start_date", nullable = true)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = true)
    private LocalDate endDate;

    public void addKioskPoi(KioskPoi kioskPoi) {
        this.kioskPoi = kioskPoi;
    }

    public BannerDetailResponseDTO toDetailResponseDTO() {
        return BannerDetailResponseDTO.builder()
                .id(id)
                .image(image.getId())
                .startDate(startDate)
                .endDate(endDate)
                .priority(priority)
                .build();
    }

}
