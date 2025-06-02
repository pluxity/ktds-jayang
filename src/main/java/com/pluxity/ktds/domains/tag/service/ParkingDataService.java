package com.pluxity.ktds.domains.tag.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ParkingDataService {

    private final JdbcTemplate secondaryJdbcTemplate;

    public List<Map<String, Object>> getAllColumn() {
        String sql = ""
                + "SELECT parkingLotName     \n"
                + "     , parkingLotId       \n"
                + "     , deviceId           \n"
                + "     , deviceName         \n"
                + "     , inoutType          \n"
                + "     , gateDatetime       \n"
                + "     , carNo              \n"
                + "     , inoutCarId         \n"
                + "     , parkingFee         \n"
                + "     , regularType        \n"
                + "FROM dbo.INOUT            \n";
        return secondaryJdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> searchInput(
            String startTime,
            String endTime,
            String deviceId,
            String inoutType,
            String exitId,
            String regularType,
            String carNo,
            String parkingLotName,
            String deviceName
    ) {
        String baseSql = ""
                + "SELECT parkingLotName \n"
                + "     , parkingLotId   \n"
                + "     , deviceId       \n"
                + "     , deviceName     \n"
                + "     , inoutType      \n"
                + "     , gateDatetime   \n"
                + "     , carNo          \n"
                + "     , inoutCarId     \n"
                + "     , parkingFee     \n"
                + "     , regularType    \n"
                + "FROM dbo.INOUT";

        List<String> conditions = new ArrayList<>();
        List<Object> params = new ArrayList<>();

        if (startTime != null && !startTime.isEmpty() && endTime != null && !endTime.isEmpty()) {
            conditions.add("gateDatetime BETWEEN ? AND ?");
            params.add(startTime);
            params.add(endTime);
        }
        if (deviceId != null && !deviceId.isEmpty()) {
            conditions.add("deviceId = ?");
            params.add(deviceId);
        }
        if (inoutType != null && !inoutType.isEmpty()) {
            conditions.add("inoutType = ?");
            params.add(inoutType);
        }
        if (exitId != null && !exitId.isEmpty()) {
            conditions.add("inoutCarId = ?");
            params.add(exitId);
        }
        if (regularType != null && !regularType.isEmpty()) {
            conditions.add("regularType = ?");
            params.add(regularType);
        }
        if (carNo != null && !carNo.isEmpty()) {
            conditions.add("carNo = ?");
            params.add(carNo);
        }
        if (parkingLotName != null && !parkingLotName.isEmpty()) {
            conditions.add("parkingLotName LIKE ?");
            params.add("%" + parkingLotName + "%");
        }
        if (deviceName != null && !deviceName.isEmpty()) {
            conditions.add("deviceName LIKE ?");
            params.add("%" + deviceName + "%");
        }

        String whereClause = conditions.isEmpty()
                ? ""
                : " WHERE " + String.join(" AND ", conditions);

        String finalSql = baseSql + whereClause;
        return secondaryJdbcTemplate.queryForList(finalSql, params.toArray());
    }
}
