package com.pluxity.ktds.domains.user.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.util.StringUtils;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Role implements GrantedAuthority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 20)
    private String name;

    @Builder
    public Role(String name) {
        this.name = name;
    }

    public void update(Role role) {
        if (StringUtils.hasText(role.getName())) {
            this.name = role.getName();
        }
    }

    @Override
    public String getAuthority() {
        return name;
    }


}
