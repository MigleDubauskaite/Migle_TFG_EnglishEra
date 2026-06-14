package com.miempresa.backend_tfg.repository;

import com.miempresa.backend_tfg.entity.UserProgress;
import com.miempresa.backend_tfg.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    // Historial de progreso de un usuario ordenado por fecha
    List<UserProgress> findByUserOrderByCompletedAtDesc(User user);
    
    // Ver si un usuario ya ha hecho un quiz específico
    List<UserProgress> findByUserAndQuizId(User user, String quizId);
}