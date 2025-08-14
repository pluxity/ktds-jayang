package com.pluxity.ktds.global.constant;

import static org.springframework.http.HttpStatus.*;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode implements Code {

  EXPIRED_ACCESS_TOKEN(UNAUTHORIZED, "ACCESS 토큰이 만료되었습니다."),
  EXPIRED_REFRESH_TOKEN(UNAUTHORIZED, "REFRESH 토큰이 만료되었습니다."),

  NOT_AUTHORIZED(UNAUTHORIZED, "권한이 없습니다."),

  DUPLICATE_USERID(BAD_REQUEST, "이미 존재 하는 아이디 입니다."),
  DUPLICATE_NAME(CONFLICT, "이미 존재하는 이름 입니다."),
  DUPLICATE_ROLE_NAME(BAD_REQUEST, "권한 이름이 이미 존재합니다."),
  DUPLICATE_USER_GROUP_NAME(BAD_REQUEST, "이미 존재하는 그룹 이름 입니다."),
  DUPLICATED_BUILDING_CODE(BAD_REQUEST, "중복된 건물 코드입니다."),
  DUPLICATED_POI_CODE(BAD_REQUEST, "중복된 POI 코드입니다."),
  DUPLICATE_CHILDREN_DATA(BAD_REQUEST, "해당 카테고리에 속한 정보가 존재합니다."),
  EXIST_CATEGORY_CONTAINING_ICON_SET(BAD_REQUEST, "해당 아이콘셋이 속한 카테고리가 존재합니다."),
  EXIST_POI_CONTAINING_CATEGORY(BAD_REQUEST, "해당 카테고리가 속한 POI가 존재합니다."),
  DUPLICATE_CATEGORY_NAME(CONFLICT, "카테고리 이름이 이미 존재합니다."),
  DUPLICATE_PATROL_NAME(CONFLICT, "이미 존재하는 순찰 이름입니다."),
  DUPLICATE_CCTV_NAME(CONFLICT, "중복된 CCTV 이름이 있습니다."),

  INVALID_JWT_TOKEN(BAD_REQUEST, "JWT 토큰이 유효하지 않습니다."),
  INVALID_FILE(BAD_REQUEST, "파일이 유효하지 않습니다."),
  INVALID_FILE_IO_STRATEGY(BAD_REQUEST, "유효하지 않은 전략 타입입니다."),
  INVALID_EXCEL_FILE(BAD_REQUEST, "엑셀 파일이 유효하지 않습니다."),
  INVALID_IMAGE_FILE(BAD_REQUEST, "이미지 파일이 유효하지 않습니다."),
  INVALID_XML_FILE(BAD_REQUEST, "XML 파일이 유효하지 않습니다."),
  INVALID_XML_TITLE(BAD_REQUEST, "XML Title 이 일치하지 않습니다."),
  INVALID_BUILDING_FILE_TITLE(BAD_REQUEST, "도면 파일명이 일치하지 않습니다."),

  INVALID_ID_OR_PASSWORD(BAD_REQUEST, "아이디 또는 비밀번호가 틀렸습니다."),
  INVALID_PASSWORD(BAD_REQUEST, "비밀번호가 틀렸습니다."),

  INVALID_ACCESS_TOKEN(UNAUTHORIZED, "ACCESS 토큰이 유효하지 않습니다."),
  INVALID_REFRESH_TOKEN(UNAUTHORIZED, "REFRESH 토큰이 유효하지 않습니다."),
  INVALID_TOKEN_FORMAT(UNAUTHORIZED, "유효하지 않은 토큰 형식입니다."),

  INVALID_CODE(BAD_REQUEST, "유효하지 않은 코드입니다."),

  NOT_FOUND_USER(BAD_REQUEST, "해당 사용자가 존재하지 않습니다."),
  NOT_FOUND_ID(BAD_REQUEST, "해당 ID에 해당하는 정보를 찾을 수 없습니다."),
  NOT_FOUND_FILE_NAME_IN_XML(BAD_REQUEST, "XML 파일에 파일 이름이 존재하지 않습니다."),
  NOT_FOUND_SBM_FLOOR(BAD_REQUEST, "SMB 파일이 존재하지 않습니다."),
  NOT_FOUND_ROLE(BAD_REQUEST, "권한이 존재하지 않습니다."),
  NOT_FOUND_USER_GROUP(BAD_REQUEST, "그룹이 존재하지 않습니다."),
  NOT_FOUND_XML_FILE(BAD_REQUEST, "XML 파일이 존재하지 않습니다."),
  NOT_FOUND_BUILDING_FILE(BAD_REQUEST, "도면 파일이 존재하지 않습니다."),
  NOT_FOUND_XML_FILE_IS_MAIN(BAD_REQUEST, "XML에 IS_MAIN이 존재하지 않습니다."),
  NOT_FOUND_FILE_DIRECTORY(BAD_REQUEST, "Directory가 존재하지 않습니다. "),
  NOT_FOUND_FILE(BAD_REQUEST, "파일이 존재하지 않습니다."),
  NOT_FOUND_plx_file(BAD_REQUEST, "PxFile이 존재하지 않습니다."),
  NOT_FOUND_BUILDING(BAD_REQUEST, "건물이 존재하지 않습니다."),
  NOT_FOUND_PATROL(BAD_REQUEST, "가상순찰 정보가 존재하지 않습니다."),
  NOT_FOUND_PATROL_POINT(BAD_REQUEST, "가상순찰 포인터 정보가 존재하지 않습니다."),
  NOT_FOUND_BUILDING_TYPE(BAD_REQUEST, "빌드 타입이 존재하지 않습니다."),
  NOT_FOUND_FLOOR(BAD_REQUEST, "건물에 층 정보가 존재하지 않습니다."),
  NOT_FOUND_ICON_SET(BAD_REQUEST, "해당 ICON_SET 정보를 찾을 수 없습니다."),
  NOT_FOUND_POI_CATEGORY_ID(BAD_REQUEST, "해당 POI 카테고리 정보를 찾을 수 없습니다."),
  NOT_FOUND_POI(BAD_REQUEST, "해당 POI를 찾을 수 없습니다."),
  NOT_FOUND_POI_CATEGORY(BAD_REQUEST, "해당 POI 카테고리를 찾을 수 없습니다."),
  NOT_FOUND_POI_SET(BAD_REQUEST, "해당 POI 세트를 찾을 수 없습니다."),
  NOT_FOUND_TOKEN(BAD_REQUEST, "해당 POI 세트를 찾을 수 없습니다."),
  NOT_FOUND_FIRE_SENSOR_DATA(BAD_REQUEST, "해당 화재센서 정보를 찾을 수 없습니다."),
  NOT_FOUND_SYSTEM_SETTING(BAD_REQUEST, "해당하는 시스템 셋팅 정보를 찾을 수 없습니다."),
  NOT_FOUND_VMS_EVENT_USAGE(BAD_REQUEST, "해당하는 VMS 이벤트 정보를 찾을 수 없습니다"),
  NOT_FOUND_WEATHER_API_DATA(BAD_REQUEST, "날씨 api 데이터가 존재하지 않습니다."),
  NOT_FOUND_EVENT_DATA(BAD_REQUEST, "이벤트 데이터가 존재하지 않습니다."),
  NOT_FOUND_CCTV_POI(BAD_REQUEST, "해당 CCTV를 찾을 수 없습니다. 해당 건물에 등록된 CCTV인지 확인해주세요."),

  EMPTY_VALUE_USERNAME(BAD_REQUEST, "아이디를 입력해주세요."),
  EMPTY_VALUE_PASSWORD(BAD_REQUEST, "비밀번호를 입력해주세요."),
  EMPTY_VALUE_NICKNAME(BAD_REQUEST, "닉네임을 입력해주세요."),
  EMPTY_VALUE_USER_GROUP_ID(BAD_REQUEST, "그룹 아이디를 입력해주세요."),
  EMPTY_VALUE_ROLE_IDS(BAD_REQUEST, "권한 아이디를 입력해주세요."),
  EMPTY_VALUE_USER_IDS(BAD_REQUEST, "사용자 아이디를 입력해주세요."),
  EMPTY_VALUE_USER_GROUP_NAME(BAD_REQUEST, "그룹 이름을 입력해주세요."),
  EMPTY_VALUE_ID(BAD_REQUEST, "아이디를 입력해주세요."),
  EMPTY_VALUE_CODE(BAD_REQUEST, "코드을 입력하여주세요."),
  EMPTY_VALUE_NAME(BAD_REQUEST, "이름을 입력하여주세요."),
  EMPTY_VALUE_USE_YN(BAD_REQUEST, "사용여부를 입력하여주세요."),
  EMPTY_POINT_LOCATION(BAD_REQUEST, "좌표정보를 입력하여주세요."),

  MULTIPLE_XML_FILES(BAD_REQUEST, "XML 파일이 2개 이상입니다."),
  FAILED_TO_PARSE_XML(BAD_REQUEST, "XML 파일 파싱에 실패했습니다."),
  FAILED_TO_ZIP_FILE(BAD_REQUEST, "파일 압축에 실패했습니다."),
  FAILED_TO_CREATE_BACKUP(INTERNAL_SERVER_ERROR, "백업 파일 생성에 실패했습니다."),
  FAILED_BATCH_REGISTER_POI(INTERNAL_SERVER_ERROR, "POI 일괄등록에 실패했습니다"),
  FAILED_TO_COMMIT(INTERNAL_SERVER_ERROR, "파일 복사에 실패 했습니다."),
  FAILED_TO_DELETE_DIRECTORY(INTERNAL_SERVER_ERROR, "디렉토리 삭제를 실패했습니다."),
  FAILED_DELETE_FILE(INTERNAL_SERVER_ERROR, "파일 삭제에 실패 했습니다."),
  FAILED_DELETE_ACCOUNT_GROUP_ACCOUNT(BAD_REQUEST, "사용자 그룹에 속한 사용자 정보가 존재 하여 삭제할 수 없습니다."),
  FAILED_SAVE_FILE(INTERNAL_SERVER_ERROR, "파일 저장에 실패했습니다."),
  FAILED_TO_WEATHER_API(BAD_REQUEST, "날씨 Api 요청에 실패했습니다."),
  NOT_MATCH_SBM_FILE(BAD_REQUEST, "층수가 일치하지 않습니다."),
  NOT_MATCH_FLOOR(BAD_REQUEST, "층수가 일치하지 않습니다."),
  DIFFERENT_FILE_NAME(BAD_REQUEST, "파일 이름이 다릅니다."),
  EMPTY_VALUE_XML_FIELD(BAD_REQUEST, "XML 파일에 해당 값이 없습니다 :"),
  EMPTY_VALUE_EXCEL_FIELD(BAD_REQUEST, "엑셀 파일에 해당 값이 없습니다 :"),
  TOO_LONG_EXCEL_FIELD(BAD_REQUEST, "엑셀 파일에 필드 길이가 깁니다 :"),

  INVALID_FILE_ENTITY_TYPE(BAD_REQUEST, "유효하지 않은 파일 타입 입니다."),
  INVALID_FLOOR_WITH_BUILDING(BAD_REQUEST, "해당 건물에 층 정보가 존재하지 않습니다."),
  INVALID_POI_CATEGORY_WITH_POI_SET(BAD_REQUEST, "해당 POI 카테고리에 POI 정보가 존재하지 않습니다."),
  INVALID_ICON_SET_ASSOCIATION(BAD_REQUEST, "해당 ICON_SET 에 POI 카테고리 정보가 존재하지 않습니다."),

  INVALID_REQUEST(BAD_REQUEST, "잘못된 요청입니다"),

  MAX_BANNER_LIMIT(BAD_REQUEST, "배너는 최대 4개까지 등록 가능합니다.");


  private final HttpStatus httpStatus;
  private final String message;

  @Override
  public HttpStatus getHttpStatus() {
    return this.httpStatus;
  }

  @Override
  public String getMessage() {
    return this.message;
  }

  @Override
  public String getStatusName() {
    return this.httpStatus.name();
  }

  @Override
  public Integer getStatusValue() {
    return this.httpStatus.value();
  }
}
