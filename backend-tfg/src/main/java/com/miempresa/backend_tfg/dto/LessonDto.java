package com.miempresa.backend_tfg.dto;

public record LessonDto(
        Long id,
        String title,
        String description,
        String level,
        String resourceType,
        String contentText,
        String assetUrl,
        String youtubeVideoId) {
}
