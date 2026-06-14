package com.miempresa.backend_tfg.repository;

import com.miempresa.backend_tfg.entity.Quiz;
import com.miempresa.backend_tfg.model.Level;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface QuizJpaRepository extends JpaRepository<Quiz, Long> {

	@Query(value = "SELECT * FROM quizzes WHERE level = :level ORDER BY RAND()", nativeQuery = true)
	List<Quiz> findRandomByLevel(@Param("level") String level, Pageable pageable);

	@Query(value = "SELECT * FROM quizzes WHERE level = :level AND question_type = :type ORDER BY RAND()", nativeQuery = true)
	List<Quiz> findRandomByLevelAndType(@Param("level") String level, @Param("type") String type, Pageable pageable);

	@Query(value = "SELECT * FROM quizzes WHERE level = :level AND id NOT IN :excludeIds ORDER BY RAND()", nativeQuery = true)
	List<Quiz> findRandomByLevelExcluding(@Param("level") String level, @Param("excludeIds") List<Long> excludeIds, Pageable pageable);

	@Query(value = "SELECT * FROM quizzes WHERE level = :level AND question_type = :type AND id NOT IN :excludeIds ORDER BY RAND()", nativeQuery = true)
	List<Quiz> findRandomByLevelAndTypeExcluding(@Param("level") String level, @Param("type") String type, @Param("excludeIds") List<Long> excludeIds, Pageable pageable);

    long countByLevel(Level level);
    long countByLevelAndQuestionType(Level level, com.miempresa.backend_tfg.model.QuizQuestionType questionType);
}
