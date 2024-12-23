package com.pluxity.ktds.domains.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.BatchSize;

import java.util.Set;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "plx_user_group")
public class UserGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 20)
    private String name;

    @OneToMany(mappedBy = "userGroup", orphanRemoval = true)
    @BatchSize(size = 10)
    private Set<User> users;

    @OneToMany(mappedBy = "userGroup", orphanRemoval = true)
    @BatchSize(size = 10)
    private Set<UserAuthority> authorities;

    @Builder
    public UserGroup(String name) {
        this.name = name;
    }

    public void addUser(User user) {
        if (!users.contains(user)) {
            users.add(user);
            user.updateUserGroup(this); // 양방향 관계 설정
        }
    }

    public void removeUser(User user) {
        if (users.contains(user)) {
            users.remove(user);
            user.updateUserGroup(null); // 양방향 관계 해제
        }
    }

}
