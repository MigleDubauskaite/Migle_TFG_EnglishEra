package com.miempresa.backend_tfg.dto;

import java.time.Instant;
import java.util.List;

public record PostDetailDto(
        Long id,
        String title,
        String body,
        String authorUsername,
        Instant createdAt,
        List<CommentDto> comments) {

    public record CommentDto(Long id, String authorUsername, String body, Instant createdAt) {}
}
