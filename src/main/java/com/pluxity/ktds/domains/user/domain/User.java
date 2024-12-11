package com.pluxity.ktds.domains.user.domain;

import com.pluxity.ktds.domains.user.dto.UserRequestDto;
import com.pluxity.ktds.security.domain.RefreshToken;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;

import java.util.Collection;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Getter
@Table(name = "users")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_group_id")
    private UserGroup userGroup;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "refresh_token_id")
    private RefreshToken refreshToken;
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private final Set<UserRole> userRoles = new HashSet<>();
    @Column(nullable = false, unique = true, length = 20)
    private String username;

    @Column(nullable = false, length = 50)
    private String nickname;

    @Column(nullable = false, length = 100)
    private String password;


    @Builder
    public User(Long id, UserGroup userGroup, String username, String nickname, String password, Role role) {
        this.id = id;
        this.userGroup = userGroup;
        this.username = username;
        this.nickname = nickname;
        this.password = password;
        if (role != null) {
            this.addUserRole(UserRole.builder()
                    .user(this)
                    .role(role)
                    .build());
        }
    }

    public void update(UserRequestDto user) {
        Optional.ofNullable(user.username())
                .filter(username -> !username.isBlank())
                .ifPresent(username -> this.username = username);
        if (StringUtils.hasText(user.password())) {
            this.password = user.password();
        }
        if (StringUtils.hasText(user.nickname())) {
            this.nickname = user.nickname();
        }
    }


    public void changeUserGroup(UserGroup userGroup) {
        this.userGroup = userGroup;
    }


    public void addUserRole(UserRole userRole) {
        userRoles.add(userRole);
        userRole.update(userRole);
    }

    public void clearRole() {
        userRoles.clear();
    }

    public void removeRole(Role role) {
        userRoles.removeIf(userRole -> userRole.getRole().equals(role));
    }


    public void updateRefreshToken(RefreshToken refreshToken) {
        this.refreshToken = refreshToken;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return userRoles.stream()
                .map(role -> new SimpleGrantedAuthority(role.getRole().getName()))
                .collect(Collectors.toSet());
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }


    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }


}
