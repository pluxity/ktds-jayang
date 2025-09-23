package com.pluxity.ktds.domains.user.entity;

import com.pluxity.ktds.domains.user.constant.MenuType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "user_group_menu")
public class UserGroupMenu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "menu_type", nullable = false, length = 20)
    private MenuType menuType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_group_id", nullable = false)
    private UserGroup userGroup;

    public UserGroupMenu(MenuType menuType, UserGroup userGroup) {
        this.menuType = menuType;
        this.userGroup = userGroup;
    }
}
