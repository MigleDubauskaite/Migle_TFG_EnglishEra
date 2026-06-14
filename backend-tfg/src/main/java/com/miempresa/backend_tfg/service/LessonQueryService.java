package com.miempresa.backend_tfg.service;

import com.miempresa.backend_tfg.dto.LessonDto;
import com.miempresa.backend_tfg.entity.Lesson;
import com.miempresa.backend_tfg.model.Level;
import com.miempresa.backend_tfg.model.LessonResourceType;
import com.miempresa.backend_tfg.repository.LessonRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Service
public class LessonQueryService {

    private final LessonRepository lessonRepository;

    public LessonQueryService(LessonRepository lessonRepository) {
        this.lessonRepository = lessonRepository;
    }

    public List<LessonDto> list(String levelParam, String typeParam) {
        LessonResourceType type = parseType(typeParam);
        Level level = parseLevel(levelParam);

        Stream<Lesson> stream;
        if (level != null && type != null) {
            stream = lessonRepository.findByLevelAndResourceTypeOrderBySortOrderAsc(level, type).stream();
        } else if (level != null) {
            stream = lessonRepository.findByLevelOrderBySortOrderAsc(level).stream();
        } else if (type != null) {
            stream = lessonRepository.findByResourceTypeOrderBySortOrderAsc(type).stream();
        } else {
            stream = lessonRepository.findAll().stream()
                    .sorted(Comparator.comparing(Lesson::getLevel).thenComparing(Lesson::getSortOrder));
        }
        return stream.map(this::toDto).toList();
    }

    private Level parseLevel(String levelParam) {
        if (levelParam == null || levelParam.isBlank()) {
            return null;
        }
        return Level.valueOf(levelParam.trim().toUpperCase());
    }

    private LessonResourceType parseType(String typeParam) {
        if (typeParam == null || typeParam.isBlank()) {
            return null;
        }
        return LessonResourceType.valueOf(typeParam.trim().toUpperCase());
    }

    private LessonDto toDto(Lesson l) {
        return new LessonDto(
                l.getId(),
                l.getTitle(),
                l.getDescription(),
                l.getLevel().name(),
                l.getResourceType().name(),
                l.getContentText(),
                l.getAssetUrl(),
                l.getYoutubeVideoId());
    }
}
