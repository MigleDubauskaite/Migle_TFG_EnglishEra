package com.miempresa.backend_tfg.dto;

public record AdminQuizDto(
        Long id,
        String level,
        String questionType,
        String prompt,
        String optA,
        String optB,
        String optC,
        String optD,
        int correctIndex
) {}
