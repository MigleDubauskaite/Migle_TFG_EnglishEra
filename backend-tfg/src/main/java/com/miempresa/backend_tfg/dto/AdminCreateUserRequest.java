package com.miempresa.backend_tfg.dto;

public record AdminCreateUserRequest(
        String username,
        String email,
        String password,
        String role,
        String currentLevel
) {}
