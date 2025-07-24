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
    private static final String COLUMN_LIST =
            "parkingLotName, parkingLotId, deviceId, deviceName, inoutType, " +
                    "CONVERT(varchar(50), gateDatetime, 120) AS gateDatetime, " +
                    "carNo, inoutCarId, parkingFee, regularType";
    private static final String BASE_QUERY = "SELECT " + COLUMN_LIST + " FROM dbo.INOUT";


    public List<Map<String, Object>> getAllColumn() {
        return secondaryJdbcTemplate.queryForList(BASE_QUERY);
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

        StringBuilder sql = new StringBuilder(BASE_QUERY);

        List<String> conditions = new ArrayList<>();
        List<Object> params = new ArrayList<>();

        if (startTime != null && !startTime.isEmpty() && endTime != null && !endTime.isEmpty()) {
            conditions.add("gateDatetime BETWEEN ? AND ?");
            params.add(startTime);
            params.add(endTime);
        }  else if (startTime != null && !startTime.isEmpty()) {
            conditions.add("gateDatetime >= ?");
            params.add(startTime);
        } else if (endTime != null && !endTime.isEmpty()) {
            conditions.add("gateDatetime <= ?");
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

        if (!conditions.isEmpty()) {
            sql.append(" WHERE ").append(String.join(" AND ", conditions));
        }
        List<Map<String, Object>> rows = secondaryJdbcTemplate.queryForList(sql.toString(), params.toArray());

        System.out.println("sql : " + sql);
        System.out.println("params : " + params);
        System.out.println("rows : " + rows);

        return rows;
    }
}
