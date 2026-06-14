package com.miempresa.backend_tfg.dto;

import java.time.Instant;

public record AdminCommentDto(
        Long id,
        Long postId,
        String postTitle,
        String authorUsername,
        String body,
        Instant createdAt
) {}
