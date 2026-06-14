package com.miempresa.backend_tfg.dto;

public record AdminStatsDto(
        long totalUsers,
        long totalQuizzes,
        long totalPosts,
        long totalEvents
) {}
