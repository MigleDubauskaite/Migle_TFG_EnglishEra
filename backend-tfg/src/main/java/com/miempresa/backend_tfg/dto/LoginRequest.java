package com.miempresa.backend_tfg.dto;

public record LoginRequest(String email, String password, Boolean rememberMe) {
}
