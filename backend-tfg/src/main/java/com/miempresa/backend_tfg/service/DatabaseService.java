package com.miempresa.backend_tfg.service;

import com.miempresa.backend_tfg.document.Quiz;
import com.miempresa.backend_tfg.repository.MongoQuizRepository;
import org.springframework.stereotype.Service;

@Service
public class DatabaseService {

    private final MongoQuizRepository mongoQuizRepository;

    public DatabaseService(MongoQuizRepository mongoQuizRepository) {
        this.mongoQuizRepository = mongoQuizRepository;
    }

    public void cargarDatosIniciales() {
        Quiz quiz = new Quiz();
        quiz.setTitle("Sample verb quiz (Mongo)");
        mongoQuizRepository.save(quiz);
    }
}