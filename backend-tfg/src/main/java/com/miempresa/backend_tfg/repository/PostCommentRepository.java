package com.miempresa.backend_tfg.repository;

import com.miempresa.backend_tfg.entity.PostComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {

    @Query("SELECT c FROM PostComment c JOIN FETCH c.post ORDER BY c.createdAt DESC")
    List<PostComment> findAllWithPost();
}
