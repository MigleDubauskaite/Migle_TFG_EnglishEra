package com.miempresa.backend_tfg.controller.rest;

import com.miempresa.backend_tfg.dto.LessonDto;
import com.miempresa.backend_tfg.service.LessonQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    private final LessonQueryService lessonQueryService;

    public LessonController(LessonQueryService lessonQueryService) {
        this.lessonQueryService = lessonQueryService;
    }

    @GetMapping
    public List<LessonDto> list(
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String type) {
        return lessonQueryService.list(level, type);
    }
}
