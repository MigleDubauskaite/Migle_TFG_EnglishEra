package com.miempresa.backend_tfg.repository;

import com.miempresa.backend_tfg.entity.Lesson;
import com.miempresa.backend_tfg.model.Level;
import com.miempresa.backend_tfg.model.LessonResourceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByLevelOrderBySortOrderAsc(Level level);

    List<Lesson> findByResourceTypeOrderBySortOrderAsc(LessonResourceType resourceType);

    List<Lesson> findByLevelAndResourceTypeOrderBySortOrderAsc(Level level, LessonResourceType resourceType);
}
