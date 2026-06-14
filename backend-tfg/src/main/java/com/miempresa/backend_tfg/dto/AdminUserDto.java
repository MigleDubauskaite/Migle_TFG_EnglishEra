package com.miempresa.backend_tfg.dto;

public record AdminUserDto(
        Long id,
        String username,
        String email,
        String role,
        String currentLevel,
        Integer totalXp
) {}
