package com.pluxity.ktds.domains.user.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.util.StringUtils;

@Entity
@Getter
@Table(name = "user_group")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String name;


    @Builder
    public UserGroup(String name) {
        this.name = name;
    }

    public void update(UserGroup userGroup) {
        if (StringUtils.hasText(userGroup.getName())) {
            this.name = userGroup.getName();
        }
    }
}
