package com.pluxity.ktds.global.constant;

import lombok.Getter;

@Getter
public enum AuthenticationPath {
  USER("users")
  ;

  private final String path;

  AuthenticationPath(String path) {
    this.path = path;
  }
}
