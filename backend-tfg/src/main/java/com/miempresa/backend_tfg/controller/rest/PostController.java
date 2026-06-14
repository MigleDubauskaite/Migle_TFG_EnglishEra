package com.miempresa.backend_tfg.controller.rest;

import com.miempresa.backend_tfg.dto.*;
import com.miempresa.backend_tfg.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public List<PostSummaryDto> list() {
        return postService.listSummaries();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDetailDto> detail(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getDetail(id));
    }

    @PostMapping
    public ResponseEntity<PostSummaryDto> create(
            @RequestBody PostCreateRequest body,
            @AuthenticationPrincipal UserDetails principal) {
        if (body.title() == null || body.title().isBlank() || body.body() == null || body.body().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.createPost(principal.getUsername(), body));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<PostDetailDto.CommentDto> comment(
            @PathVariable Long id,
            @RequestBody CommentCreateRequest body,
            @AuthenticationPrincipal UserDetails principal) {
        if (body.body() == null || body.body().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(postService.addComment(principal.getUsername(), id, body));
    }
}
