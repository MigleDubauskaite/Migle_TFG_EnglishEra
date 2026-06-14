package com.miempresa.backend_tfg.controller.web;

import com.miempresa.backend_tfg.service.DatabaseService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class HomeController {

    private final DatabaseService dbService;

    public HomeController(DatabaseService dbService) {
        this.dbService = dbService;
    }

    @GetMapping("/")
    public String index() {
        return "home/index"; // Esto busca src/main/resources/templates/index.html
    }

    @PostMapping("/cargar-datos")
    public String cargar() {
        dbService.cargarDatosIniciales();
        return "redirect:/?success=true";
    }
}