package com.miempresa.backend_tfg.dto;

public record UserProfileDto(Long id, String username, String email, String currentLevel, int totalXp, String role) {
}
