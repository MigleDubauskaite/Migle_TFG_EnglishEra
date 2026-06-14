package com.miempresa.backend_tfg.repository;

import com.miempresa.backend_tfg.document.Resource;
import com.miempresa.backend_tfg.model.Level;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ResourceRepository extends MongoRepository<Resource, String> {
    // Buscar recursos por nivel (A1, B2, etc.)
    List<Resource> findByLevel(Level level);
    
    // Buscar por tipo (VIDEO, PDF)
    List<Resource> findByType(String type);
}