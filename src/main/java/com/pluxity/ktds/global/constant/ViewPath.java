package com.pluxity.ktds.global.constant;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ViewPath {

    ADMIN_ICON_SET("/admin/icon-set","admin/icon-set/icon-set"),
    ADMIN_POI_LIST("/admin/poi-list", "admin/poi-list/poi-list"),
    ADMIN_POI_CATEGORY("/admin/poi-category", "admin/poi-category/poi-category"),
    ADMIN_BUILDING_OUTDOOR("/admin/building/outdoor", "admin/building/outdoor"),
    ADMIN_BUILDING_INDOOR("/admin/building/indoor", "admin/building/indoor"),
    ADMIN_VIEWER("/admin/viewer", "admin/viewer/viewer"),
    ADMIN_USER("/admin/user", "admin/user/user"),
    ADMIN_USER_GROUP("/admin/user-group", "admin/user-group/user-group"),
    ADMIN_SYSTEM_SETTING("/admin/system-setting", "admin/system-setting/system-setting"),
    ADMIN_NOTICE("/admin/notice", "admin/notice/notice"),

    LOGIN("/login", "login/login"),
    LOGIN_FAILURE("/login/failure", "login/failure/accessDenied"),
    DEFAULT("/", "login/login"),

    VIEWER_MAIN("/viewer","viewer/index"),
    VIEWER_MAP("/map","map/index"),
    ;

    private final String path;
    private final String view;
}
