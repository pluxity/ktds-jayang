package com.pluxity.ktds.domains.event.repository;

import com.pluxity.ktds.domains.event.entity.Alarm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Optional;

public interface EventPollingRepository extends JpaRepository<Alarm, Long> {

    @Query("SELECT MAX(a.occurrenceDate) FROM Alarm a")
    Optional<LocalDateTime> findLastEventTime();
}
