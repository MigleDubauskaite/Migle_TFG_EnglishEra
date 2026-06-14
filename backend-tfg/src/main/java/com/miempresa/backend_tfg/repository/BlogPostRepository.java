package com.miempresa.backend_tfg.repository;

import com.miempresa.backend_tfg.document.BlogPost;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BlogPostRepository extends MongoRepository<BlogPost, String> {
    // Obtener los posts más nuevos primero
    List<BlogPost> findAllByOrderByPublishedAtDesc();
}