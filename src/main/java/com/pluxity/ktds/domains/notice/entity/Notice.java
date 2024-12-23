package com.pluxity.ktds.domains.notice.entity;

import com.pluxity.ktds.global.auditing.AuditableEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "notice")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notice extends AuditableEntity {

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "content")
    private String content;

    @Column(name = "is_urgent")
    private Boolean isUrgent;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @Builder
    public Notice(String title, String content, Boolean isUrgent, LocalDateTime expiredAt) {
        this.title = title;
        this.content = content;
        this.isUrgent = isUrgent;
        this.expiredAt = expiredAt;
    }

    public void update(String title, String content, Boolean isUrgent, LocalDateTime expiredAt) {
        this.title = title;
        this.content = content;
        this.isUrgent = isUrgent;
        this.expiredAt = expiredAt;
    }

}
