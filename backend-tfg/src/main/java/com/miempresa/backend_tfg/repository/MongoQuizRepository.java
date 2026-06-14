package com.miempresa.backend_tfg.repository;

import com.miempresa.backend_tfg.document.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoQuizRepository extends MongoRepository<Quiz, String> {
    Quiz findByResourceId(String resourceId);
}
