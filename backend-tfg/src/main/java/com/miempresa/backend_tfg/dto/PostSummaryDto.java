package com.miempresa.backend_tfg.dto;

import java.time.Instant;

public record PostSummaryDto(Long id, String title, String authorUsername, Instant createdAt) {
}
