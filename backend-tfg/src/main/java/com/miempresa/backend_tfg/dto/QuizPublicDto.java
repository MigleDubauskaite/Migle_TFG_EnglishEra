package com.miempresa.backend_tfg.dto;

import java.util.List;

public record QuizPublicDto(Long id, String questionType, String prompt, List<String> options) {
}
