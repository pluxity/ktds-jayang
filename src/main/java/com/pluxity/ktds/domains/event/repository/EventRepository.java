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
            GROUP BY FORMATDATETIME(a.occurrenceDate, 'MM/dd')
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
            + "(STR_TO_DATE(a.occurrenceDate, '%Y/%m/%d %H:%i:%s') >= :startDate OR :startDate IS NULL) "
            + "AND (STR_TO_DATE(a.occurrenceDate, '%Y/%m/%d %H:%i:%s') <= :endDate OR :endDate IS NULL)")
    List<Alarm> findAlarmsByDateRange(@Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate);

    List<Alarm> findByOccurrenceDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Alarm a WHERE a.id = :id")
    Optional<Alarm> findByIdForUpdate(Long id);
    @Query("SELECT a FROM Alarm a WHERE a.confirmTime IS NULL ORDER BY a.occurrenceDate ASC")
    List<Alarm> findUnDisableAlarms();

    List<Alarm> findByOccurrenceDateBetweenAndBuildingNm(LocalDateTime occurrenceDateAfter, LocalDateTime occurrenceDateBefore, String buildingNm);

    List<Alarm> findByOccurrenceDateBetweenAndBuildingNmAndFloorNm(LocalDateTime occurrenceDateAfter, LocalDateTime occurrenceDateBefore, String buildingNm, String floorNm);

    List<Alarm> findByOccurrenceDateBetweenAndFloorNm(LocalDateTime occurrenceDateAfter, LocalDateTime occurrenceDateBefore, String floorNm);
    List<Alarm> findByOccurrenceDateBetweenAndFloorNmAndAlarmType(LocalDateTime occurrenceDateAfter, LocalDateTime occurrenceDateBefore, String floorNm, String eventNm);
}
