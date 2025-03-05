package com.pluxity.ktds.domains.event.repository;

import com.pluxity.ktds.domains.event.entity.Alarm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Alarm, Long> {

    @Query("SELECT MAX(a.occurrenceDate) FROM Alarm a")
    Optional<LocalDateTime> findLastEventTime();
    
    @Query("SELECT a FROM Alarm a WHERE a.occurrenceDate > :timeStamp")
    List<Alarm> findEventsAfter(LocalDateTime timeStamp);

    List<Alarm> findAll();
}
