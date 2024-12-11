package com.pluxity.ktds.security.domain;

import com.pluxity.ktds.domains.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "refresh_token")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(unique = true, nullable = false)
    private String tokenId;
    @Column(nullable = false)
    private String refreshToken;


    @Builder
    public RefreshToken(Long id, User user, String tokenId, String refreshToken) {
        this.id = id;
        this.user = user;
        this.tokenId = tokenId;
        this.refreshToken = refreshToken;
    }

    public void update(RefreshToken refreshToken) {
        if (refreshToken.getRefreshToken() != null) {
            this.refreshToken = refreshToken.getRefreshToken();
        }
    }

    public void delete() {
        if (getUser() != null) {
            getUser().updateRefreshToken(null);
        }
    }
}
