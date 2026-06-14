package com.miempresa.backend_tfg.dto;

import java.time.LocalDate;
import java.time.Instant;

public record EventDto(
        Long id,
        String title,
        String description,
        String category,
        String location,
        Boolean online,
        LocalDate eventDate,
        Instant createdAt,
        String createdBy) {
}
