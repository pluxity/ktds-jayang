package com.pluxity.ktds.domains.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "kiosk_user")
public class KioskUser {

    @Builder
    public KioskUser(final String password, final String name){
        this.password = password;
        this.name = name;

    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String name;

    public void changePassword(final String newPassword) {
        this.password = newPassword;
    }
}
