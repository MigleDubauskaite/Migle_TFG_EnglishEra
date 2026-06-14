package com.miempresa.backend_tfg.controller.rest;

import com.miempresa.backend_tfg.dto.UserProfileDto;
import com.miempresa.backend_tfg.model.Level;
import com.miempresa.backend_tfg.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> me(@AuthenticationPrincipal UserDetails principal) {
        var user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        String level = user.getCurrentLevel() != null ? user.getCurrentLevel().name() : Level.A1.name();
        int xp = user.getTotalXp() == null ? 0 : user.getTotalXp();
        String role = user.getRole() != null ? user.getRole() : "USER";
        return ResponseEntity.ok(new UserProfileDto(
                user.getId(), user.getUsername(), user.getEmail(), level, xp, role));
    }
}
