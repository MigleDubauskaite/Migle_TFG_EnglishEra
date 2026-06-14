package com.miempresa.backend_tfg.dto;

import java.util.List;

public record QuizResultDto(
        int correct,
        int total,
        int xpEarned,
        int newTotalXp,
        String newLevel,
        List<QuizReviewItemDto> review
) {}

