package com.miempresa.backend_tfg.repository;

import com.miempresa.backend_tfg.entity.UserAnswer;
import com.miempresa.backend_tfg.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserAnswerRepository extends JpaRepository<UserAnswer, Long> {
    // Obtener todas las respuestas de un intento de examen específico
    List<UserAnswer> findByProgress(UserProgress progress);
}