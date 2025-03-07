package com.pluxity.ktds.domains.event.repository;

import com.pluxity.ktds.domains.event.dto.Last24HoursEventDTO;
import com.pluxity.ktds.domains.event.dto.Last7DaysDateCountDTO;
import com.pluxity.ktds.domains.event.dto.Last7DaysProcessCountDTO;
import com.pluxity.ktds.domains.event.entity.Alarm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

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
}
