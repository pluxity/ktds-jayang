package com.pluxity.ktds.domains.event.repository;

import com.pluxity.ktds.domains.event.dto.Last24HoursEventDTO;
import com.pluxity.ktds.domains.event.dto.Last7DaysDateCountDTO;
import com.pluxity.ktds.domains.event.dto.Last7DaysProcessCountDTO;
import com.pluxity.ktds.domains.event.entity.Alarm;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Alarm, Long> {
    @Query("""
            SELECT new com.pluxity.ktds.domains.event.dto.Last7DaysProcessCountDTO(a.process, COUNT(a.id))
            FROM Alarm a
            WHERE a.occurrenceDate >= :sevenDays
            GROUP BY a.process
         """)
    List<Last7DaysProcessCountDTO> findProcessCountsForLast7Days(@Param("sevenDays") LocalDateTime sevenDays);
    
    @Query("""
            SELECT new com.pluxity.ktds.domains.event.dto.Last7DaysDateCountDTO(
                MIN(a.occurrenceDate),
                COUNT(a.id)
            )
            FROM Alarm a
            WHERE a.occurrenceDate >= :sevenDays
            GROUP BY DATE_FORMAT(a.occurrenceDate, '%m/%d')
            ORDER BY MIN(a.occurrenceDate)
            """)
    List<Last7DaysDateCountDTO> findDateCountsForLast7Days(@Param("sevenDays") LocalDateTime sevenDays);

    @Query("""
            SELECT new com.pluxity.ktds.domains.event.dto.Last24HoursEventDTO(
                a.buildingNm,
                a.floorNm,
                a.alarmType,
                a.deviceNm,
                a.occurrenceDate
            )
            FROM Alarm a
            WHERE a.occurrenceDate >= :last24Hours
            ORDER BY a.occurrenceDate DESC
        """)
    List<Last24HoursEventDTO> findLatest24HoursEventList(@Param("last24Hours") LocalDateTime last24Hours);

    @Query("SELECT a FROM Alarm a WHERE (:startDate IS NULL OR a.occurrenceDate >= :startDate) AND (:endDate IS NULL OR a.occurrenceDate <= :endDate)")
    List<Alarm> getAlarmsByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT a FROM Alarm a WHERE "
            + "(DATE_FORMAT(a.occurrenceDate, '%Y/%m/%d %H:%i:%s') >= :startDate OR :startDate IS NULL) "
            + "AND (DATE_FORMAT(a.occurrenceDate, '%Y/%m/%d %H:%i:%s') <= :endDate OR :endDate IS NULL)")
    List<Alarm> findAlarmsByDateRange(@Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate);

    List<Alarm> findByOccurrenceDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Alarm a WHERE a.id = :id")
    Optional<Alarm> findByIdForUpdate(Long id);
    @Query("SELECT a FROM Alarm a WHERE a.confirmTime IS NULL ORDER BY a.occurrenceDate DESC LIMIT 1")
    Alarm findUnDisableAlarms();

    @Query("SELECT a FROM Alarm a " +
            "WHERE a.occurrenceDate BETWEEN :startDate AND :endDate " +
            "AND (:buildingNm IS NULL OR a.buildingNm = :buildingNm) " +
            "AND (:floorNm IS NULL OR a.floorNm = :floorNm) " +
            "AND (:deviceType IS NULL OR a.equipment = :deviceType) " +
            "AND (:searchValue IS NULL OR (a.deviceNm LIKE CONCAT('%', :searchValue, '%') " +
            "     OR CONCAT('', a.alarmType) LIKE CONCAT('%', :searchValue, '%')))")
    List<Alarm> findAlarms(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("buildingNm") String buildingNm,
            @Param("floorNm") String floorNm,
            @Param("deviceType") String deviceType,
            @Param("searchValue") String searchValue);
}
