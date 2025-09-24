package com.pluxity.ktds.global.security;

import com.pluxity.ktds.domains.user.entity.User;
import lombok.Builder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public record CustomUserDetails(User user) implements UserDetails {

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return Stream.concat(
            Stream.concat(
                    Stream.concat(
                            user.getUserGroup().getAuthorities().stream()
                                    .map(a -> new SimpleGrantedAuthority(a.getName())),
                            user.getUserGroup().getBuildingPermissions().stream()
                                    .map(bp -> new SimpleGrantedAuthority("BUILDING_" + bp.getBuilding().getId()))
                    ),
                    user.getUserGroup().getCategoryPermissions().stream()
                            .filter(cp -> Boolean.TRUE.equals(cp.getCanRead()) || Boolean.TRUE.equals(cp.getCanWrite()))
                            .map(cp -> new SimpleGrantedAuthority("POI_" + cp.getPoiCategory().getId()))
            ),
            user.getUserGroup().getMenuPermissions().stream()
                    .map(mp -> new SimpleGrantedAuthority("ROLE_" + mp.getMenuType().name()))
    ).collect(Collectors.toSet());
  }

  @Override
  public String getPassword() { return user.getPassword(); }

  @Override
  public String getUsername() { return user.getUsername(); }

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
