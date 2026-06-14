package com.miempresa.backend_tfg.repository;

import com.miempresa.backend_tfg.entity.UserLesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserLessonRepository extends JpaRepository<UserLesson, Long> {
    List<UserLesson> findByUserId(Long userId);
    boolean existsByUserIdAndLessonId(Long userId, Long lessonId);
}
