package com.miempresa.backend_tfg.dto;

import java.util.List;

/**
 * One question's outcome included in the quiz submit response
 * so the front-end can show the learner what they got right/wrong.
 */
public record QuizReviewItemDto(
        String prompt,
        List<String> options,
        int selectedIndex,   // what the user chose (-1 = unanswered)
        int correctIndex,    // the correct option index
        boolean wasCorrect
) {}
