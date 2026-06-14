package com.miempresa.backend_tfg.controller.rest;

import com.miempresa.backend_tfg.dto.LoginRequest;
import com.miempresa.backend_tfg.dto.LoginResponse;
import com.miempresa.backend_tfg.dto.RegisterRequest;
import com.miempresa.backend_tfg.entity.User;
import com.miempresa.backend_tfg.model.Level;
import com.miempresa.backend_tfg.repository.UserRepository;
import com.miempresa.backend_tfg.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (request.username() == null || request.username().isBlank()
                || request.email() == null || request.email().isBlank()
                || request.password() == null || request.password().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid registration data."));
        }
        if (userRepository.existsByUsername(request.username().trim())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "A user with that username already exists. Please choose a different one."));
        }
        if (userRepository.existsByEmail(request.email().trim())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Email already registered."));
        }

        User user = new User();
        user.setUsername(request.username().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole("USER");
        Level chosenLevel = Level.A1;
        if (request.level() != null && !request.level().isBlank()) {
            try { chosenLevel = Level.valueOf(request.level().trim().toUpperCase()); } catch (IllegalArgumentException ignored) {}
        }
        user.setCurrentLevel(chosenLevel);
        user.setTotalXp(0);
        user = userRepository.save(user);

        String token = jwtService.generateToken(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(toLoginResponse(user, token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        var userOpt = userRepository.findByEmail(loginRequest.email().trim().toLowerCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password."));
        }
        User user = userOpt.get();
        if (!passwordEncoder.matches(loginRequest.password(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password."));
        }
        long expMs = Boolean.TRUE.equals(loginRequest.rememberMe())
                ? 365L * 24 * 60 * 60 * 1000   // 1 año
                :   1L * 24 * 60 * 60 * 1000;   // 1 día
        String token = jwtService.generateToken(user, expMs);
        return ResponseEntity.ok(toLoginResponse(user, token));
    }

    private LoginResponse toLoginResponse(User user, String token) {
        String level = user.getCurrentLevel() != null ? user.getCurrentLevel().name() : Level.A1.name();
        int xp = user.getTotalXp() == null ? 0 : user.getTotalXp();
        String role = user.getRole() != null ? user.getRole() : "USER";
        return new LoginResponse(user.getId(), user.getUsername(), user.getEmail(), level, xp, token, role);
    }
}
