package com.miempresa.backend_tfg.dto;

public record LoginResponse(
        Long id,
        String username,
        String email,
        String currentLevel,
        int totalXP,
        String token,
        String role) {
}
