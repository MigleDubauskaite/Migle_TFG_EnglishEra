package com.miempresa.backend_tfg.controller.rest;

import com.miempresa.backend_tfg.dto.*;
import com.miempresa.backend_tfg.entity.Quiz;
import com.miempresa.backend_tfg.entity.User;
import com.miempresa.backend_tfg.model.Level;
import com.miempresa.backend_tfg.model.QuizQuestionType;
import com.miempresa.backend_tfg.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final QuizJpaRepository quizRepository;
    private final PostRepository postRepository;
    private final PostCommentRepository commentRepository;
    private final EventRepository eventRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(
            UserRepository userRepository,
            QuizJpaRepository quizRepository,
            PostRepository postRepository,
            PostCommentRepository commentRepository,
            EventRepository eventRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.quizRepository = quizRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.eventRepository = eventRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ── Stats ────────────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> stats() {
        return ResponseEntity.ok(new AdminStatsDto(
                userRepository.count(),
                quizRepository.count(),
                postRepository.count(),
                eventRepository.count()));
    }

    // ── Users ────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> listUsers() {
        List<AdminUserDto> users = userRepository.findAll().stream()
                .map(u -> new AdminUserDto(
                        u.getId(),
                        u.getUsername(),
                        u.getEmail(),
                        u.getRole() != null ? u.getRole() : "USER",
                        u.getCurrentLevel() != null ? u.getCurrentLevel().name() : "A1",
                        u.getTotalXp() != null ? u.getTotalXp() : 0))
                .toList();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users")
    public ResponseEntity<AdminUserDto> createUser(@RequestBody AdminCreateUserRequest req) {
        if (userRepository.existsByEmail(req.email().trim().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered.");
        }
        if (userRepository.existsByUsername(req.username().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken.");
        }
        User u = new User();
        u.setUsername(req.username().trim());
        u.setEmail(req.email().trim().toLowerCase());
        u.setPassword(passwordEncoder.encode(req.password()));
        u.setRole(req.role() != null && !req.role().isBlank() ? req.role().toUpperCase() : "USER");
        Level level = Level.A1;
        if (req.currentLevel() != null && !req.currentLevel().isBlank()) {
            try { level = Level.valueOf(req.currentLevel().toUpperCase()); } catch (IllegalArgumentException ignored) {}
        }
        u.setCurrentLevel(level);
        u.setTotalXp(0);
        u = userRepository.save(u);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new AdminUserDto(u.getId(), u.getUsername(), u.getEmail(), u.getRole(), u.getCurrentLevel().name(), 0));
    }

    @PatchMapping("/users/{id}")
    public ResponseEntity<AdminUserDto> updateUser(@PathVariable Long id, @RequestBody AdminUpdateUserRequest req) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        if (req.username() != null && !req.username().isBlank()) {
            String newUsername = req.username().trim();
            if (!newUsername.equals(u.getUsername()) && userRepository.existsByUsername(newUsername)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken.");
            }
            u.setUsername(newUsername);
        }
        if (req.email() != null && !req.email().isBlank()) {
            String newEmail = req.email().trim().toLowerCase();
            if (!newEmail.equals(u.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered.");
            }
            u.setEmail(newEmail);
        }
        if (req.password() != null && !req.password().isBlank()) {
            if (req.password().length() < 6) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters.");
            u.setPassword(passwordEncoder.encode(req.password()));
        }
        if (req.role() != null && !req.role().isBlank()) {
            u.setRole(req.role().toUpperCase());
        }
        if (req.currentLevel() != null && !req.currentLevel().isBlank()) {
            try { u.setCurrentLevel(Level.valueOf(req.currentLevel().toUpperCase())); }
            catch (IllegalArgumentException e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid level."); }
        }
        userRepository.save(u);
        return ResponseEntity.ok(new AdminUserDto(u.getId(), u.getUsername(), u.getEmail(), u.getRole(),
                u.getCurrentLevel().name(), u.getTotalXp() != null ? u.getTotalXp() : 0));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        if ("ADMIN".equals(u.getRole())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete an admin user.");
        }
        userRepository.delete(u);
        return ResponseEntity.ok(Map.of("message", "User deleted."));
    }

    // ── Comments ─────────────────────────────────────────────────────────────

    @GetMapping("/comments")
    public ResponseEntity<List<AdminCommentDto>> listComments() {
        List<AdminCommentDto> comments = commentRepository.findAllWithPost().stream()
                .map(c -> new AdminCommentDto(
                        c.getId(),
                        c.getPost().getId(),
                        c.getPost().getTitle(),
                        c.getAuthorUsername(),
                        c.getBody(),
                        c.getCreatedAt()))
                .toList();
        return ResponseEntity.ok(comments);
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Map<String, String>> deleteComment(@PathVariable Long id) {
        if (!commentRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found.");
        }
        commentRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Comment deleted."));
    }

    // ── Quizzes ───────────────────────────────────────────────────────────────

    @GetMapping("/quizzes")
    public ResponseEntity<List<AdminQuizDto>> listQuizzes(
            @RequestParam(required = false) String level) {
        List<Quiz> quizzes;
        if (level != null && !level.isBlank()) {
            try {
                Level lvl = Level.valueOf(level.toUpperCase());
                quizzes = quizRepository.findAll().stream()
                        .filter(q -> lvl.equals(q.getLevel()))
                        .toList();
            } catch (IllegalArgumentException e) {
                quizzes = quizRepository.findAll();
            }
        } else {
            quizzes = quizRepository.findAll();
        }
        List<AdminQuizDto> result = quizzes.stream()
                .map(q -> new AdminQuizDto(
                        q.getId(),
                        q.getLevel().name(),
                        q.getQuestionType().name(),
                        q.getPrompt(),
                        q.getOptA(), q.getOptB(), q.getOptC(), q.getOptD(),
                        q.getCorrectIndex()))
                .toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/quizzes")
    public ResponseEntity<AdminQuizDto> createQuiz(@RequestBody AdminCreateQuizRequest req) {
        Quiz q = new Quiz();
        q.setLevel(Level.valueOf(req.level().toUpperCase()));
        q.setQuestionType(QuizQuestionType.valueOf(req.questionType().toUpperCase()));
        q.setPrompt(req.prompt().trim());
        q.setOptA(req.optA().trim());
        q.setOptB(req.optB().trim());
        q.setOptC(req.optC().trim());
        q.setOptD(req.optD().trim());
        q.setCorrectIndex(req.correctIndex());
        q = quizRepository.save(q);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new AdminQuizDto(q.getId(), q.getLevel().name(), q.getQuestionType().name(),
                        q.getPrompt(), q.getOptA(), q.getOptB(), q.getOptC(), q.getOptD(), q.getCorrectIndex()));
    }

    @PatchMapping("/quizzes/{id}")
    public ResponseEntity<AdminQuizDto> updateQuiz(@PathVariable Long id, @RequestBody AdminCreateQuizRequest req) {
        Quiz q = quizRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found."));
        q.setLevel(Level.valueOf(req.level().toUpperCase()));
        q.setQuestionType(QuizQuestionType.valueOf(req.questionType().toUpperCase()));
        q.setPrompt(req.prompt().trim());
        q.setOptA(req.optA().trim());
        q.setOptB(req.optB().trim());
        q.setOptC(req.optC().trim());
        q.setOptD(req.optD().trim());
        q.setCorrectIndex(req.correctIndex());
        q = quizRepository.save(q);
        return ResponseEntity.ok(new AdminQuizDto(q.getId(), q.getLevel().name(), q.getQuestionType().name(),
                q.getPrompt(), q.getOptA(), q.getOptB(), q.getOptC(), q.getOptD(), q.getCorrectIndex()));
    }

    @DeleteMapping("/quizzes/{id}")
    public ResponseEntity<Map<String, String>> deleteQuiz(@PathVariable Long id) {
        if (!quizRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found.");
        }
        quizRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Question deleted."));
    }

    // ── Posts ─────────────────────────────────────────────────────────────────

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Map<String, String>> deletePost(@PathVariable Long id) {
        if (!postRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found.");
        }
        postRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Post deleted."));
    }
}
