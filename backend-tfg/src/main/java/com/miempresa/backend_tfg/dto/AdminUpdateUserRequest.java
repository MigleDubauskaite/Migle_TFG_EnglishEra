package com.miempresa.backend_tfg.dto;

public record AdminUpdateUserRequest(
        String username,
        String email,
        String password,
        String role,
        String currentLevel
) {}
