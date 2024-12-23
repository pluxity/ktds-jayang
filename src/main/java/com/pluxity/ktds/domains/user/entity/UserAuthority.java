package com.pluxity.ktds.domains.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "plx_user_authority")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class UserAuthority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 20)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_group_id", nullable = false)
    private UserGroup userGroup;

    @Builder
    public UserAuthority(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "AUTH_" + name;
    }
}
