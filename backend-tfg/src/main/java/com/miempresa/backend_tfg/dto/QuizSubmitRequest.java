package com.miempresa.backend_tfg.dto;

import java.util.List;

public record QuizSubmitRequest(String level, List<QuizAnswerItem> answers) {
    public record QuizAnswerItem(Long questionId, int selectedIndex) {}
}
