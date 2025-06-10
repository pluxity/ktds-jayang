package com.pluxity.ktds.domains.event.dto;


import java.time.LocalDateTime;

public record Last7DaysDateCountDTO(
    LocalDateTime occurrenceDate,
    Long count
) {}
