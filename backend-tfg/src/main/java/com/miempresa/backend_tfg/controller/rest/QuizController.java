package com.miempresa.backend_tfg.controller.rest;

import com.miempresa.backend_tfg.dto.QuizPublicDto;
import com.miempresa.backend_tfg.dto.QuizResultDto;
import com.miempresa.backend_tfg.dto.QuizStatsDto;
import com.miempresa.backend_tfg.dto.QuizSubmitRequest;
import com.miempresa.backend_tfg.model.Level;
import com.miempresa.backend_tfg.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/stats")
    public QuizStatsDto stats() {
        return quizService.stats();
    }

    @GetMapping("/random")
    public ResponseEntity<List<QuizPublicDto>> random(
            @RequestParam String level,
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String excludeIds) {
        Level lvl = Level.valueOf(level.trim().toUpperCase());
        int capped = Math.min(Math.max(limit, 1), 20);
        List<Long> excluded = (excludeIds != null && !excludeIds.isBlank())
            ? Arrays.stream(excludeIds.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Long::parseLong)
                    .collect(Collectors.toList())
            : Collections.emptyList();
        return ResponseEntity.ok(quizService.randomQuestions(lvl, capped, type, excluded));
    }

    @PostMapping("/submit")
    public ResponseEntity<QuizResultDto> submit(
            @RequestBody QuizSubmitRequest body,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(quizService.submit(principal.getUsername(), body));
    }
}
