package com.miempresa.backend_tfg.dto;

public record AdminCreateQuizRequest(
        String level,
        String questionType,
        String prompt,
        String optA,
        String optB,
        String optC,
        String optD,
        int correctIndex
) {}
