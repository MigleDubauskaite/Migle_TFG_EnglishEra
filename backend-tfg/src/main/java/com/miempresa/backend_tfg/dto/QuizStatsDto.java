package com.miempresa.backend_tfg.dto;

import java.util.Map;

public record QuizStatsDto(long total, Map<String, Long> byLevel) {
}
