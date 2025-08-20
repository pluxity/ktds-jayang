package com.pluxity.ktds.domains.parking.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ApiCode {

    OK(0, "OK"),
    ERROR(-1, "ERROR"),
    BAD_REQUEST(400, "BAD_REQUEST"),
    UNAUTHORIZED(401, "UNAUTHORIZED"),
    FORBIDDEN(403, "FORBIDDEN"),
    NOTFOUND(404, "NOTFOUND"),
    AUTH_ERROR(4010, "AUTH_ERROR");

    private final int code;
    private final String msg;
}
