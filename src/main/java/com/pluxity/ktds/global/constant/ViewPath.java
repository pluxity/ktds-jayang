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
    ADMIN_USER_INFO("/admin/userInfo", "admin/user/userInfo"),
    ADMIN_USER_GROUP("/admin/user-group", "admin/user-group/user-group"),
    ADMIN_SYSTEM_SETTING("/admin/system-setting", "admin/system-setting/system-setting"),
    ADMIN_NOTICE("/admin/notice", "admin/notice/notice"),
    ADMIN_MNG_VENDOR("/admin/management/vendor", "admin/management/vendor"),
    ADMIN_MNG_MAINTENANCE("/admin/management/maintenance", "admin/management/maintenance"),

    ADMIN_SOP("/admin/sop", "admin/sop/sop"),

    LOGIN("/login", "login/login"),
    KIOSK_LOGIN("/kiosk-login", "login/kiosk-login"),
    LOGIN_FAILURE("/login/failure", "login/failure/accessDenied"),
    DEFAULT("/", "login/login"),

    VIEWER_MAIN("/viewer","viewer/index"),
    IFRAME_POP("/lightPopFrame","viewer/lightPopFrame"),
    VIEWER_MAP("/map","map/index"),

    KIOSK_ADMIN_VIEWER("/kiosk/admin/viewer", "kioskAdmin/viewer/viewer"),
    KIOSK_VIEWER("/kioskViewer", "kioskViewer/index");

    private final String path;
    private final String view;
}
