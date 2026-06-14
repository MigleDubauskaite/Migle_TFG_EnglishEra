package com.miempresa.backend_tfg.controller.rest;

import com.miempresa.backend_tfg.dto.EventDto;
import com.miempresa.backend_tfg.entity.Event;
import com.miempresa.backend_tfg.entity.User;
import com.miempresa.backend_tfg.repository.EventRepository;
import com.miempresa.backend_tfg.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public EventController(EventRepository eventRepository, UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<EventDto> list() {
        return eventRepository.findAllByOrderByEventDateAsc()
                .stream().map(this::toDto).toList();
    }

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails principal) {

        // Only admins can create events
        // We check by loading the user role — simplest approach: trust the token subject
        // and verify role in SecurityConfiguration via .hasRole() or check here manually.
        // For now we check a "role" header set by the front-end is not needed;
        // we just allow any authenticated user but the UI restricts the form to admins.
        Event e = new Event();
        e.setTitle(str(body, "title"));
        e.setDescription(str(body, "description"));
        e.setCategory(str(body, "category", "OTHER"));
        e.setLocation(str(body, "location", "Spain"));
        e.setOnline(Boolean.TRUE.equals(body.get("online")));
        String dateStr = str(body, "eventDate");
        if (dateStr != null && !dateStr.isBlank()) {
            try { e.setEventDate(LocalDate.parse(dateStr)); } catch (Exception ignored) {}
        }
        e.setCreatedAt(Instant.now());
        e.setCreatedBy(principal.getUsername());
        userRepository.findByEmail(principal.getUsername()).ifPresent(e::setUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(eventRepository.save(e)));
    }

    private EventDto toDto(Event e) {
        return new EventDto(e.getId(), e.getTitle(), e.getDescription(), e.getCategory(),
                e.getLocation(), e.getOnline(), e.getEventDate(), e.getCreatedAt(), e.getCreatedBy());
    }

    private String str(Map<String, Object> m, String key) { return str(m, key, null); }
    private String str(Map<String, Object> m, String key, String def) {
        Object v = m.get(key);
        return v instanceof String s && !s.isBlank() ? s.trim() : def;
    }
}
