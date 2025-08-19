package com.pluxity.ktds.domains.parking.dto;

import com.pluxity.ktds.domains.parking.entity.ApiCode;

public record ApiResponse<T>(int code, String msg, T result) {
    public static <T> ApiResponse<T> ok(T result) {
        return new ApiResponse<>(ApiCode.OK.getCode(), ApiCode.OK.getMsg(), result);
    }
    public static <T> ApiResponse<T> error(ApiCode c) {
        return new ApiResponse<>(c.getCode(), c.getMsg(), null);
    }
}
