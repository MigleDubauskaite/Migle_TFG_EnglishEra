package com.miempresa.backend_tfg.repository;

import com.miempresa.backend_tfg.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    Achievement findByName(String name);
}