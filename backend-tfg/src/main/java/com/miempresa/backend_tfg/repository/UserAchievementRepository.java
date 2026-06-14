package com.miempresa.backend_tfg.repository;

import com.miempresa.backend_tfg.entity.UserAchievement;
import com.miempresa.backend_tfg.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {
    // Para sacar todos los logros de un usuario concreto
    List<UserAchievement> findByUser(User user);
}