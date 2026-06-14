package com.miempresa.backend_tfg.service;

import com.miempresa.backend_tfg.dto.*;
import com.miempresa.backend_tfg.entity.Post;
import com.miempresa.backend_tfg.entity.PostComment;
import com.miempresa.backend_tfg.entity.User;
import com.miempresa.backend_tfg.repository.PostRepository;
import com.miempresa.backend_tfg.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    public List<PostSummaryDto> listSummaries() {
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(p -> new PostSummaryDto(p.getId(), p.getTitle(), p.getAuthorUsername(), p.getCreatedAt()))
                .toList();
    }

    @Transactional(readOnly = true)
    public PostDetailDto getDetail(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        List<PostDetailDto.CommentDto> comments = post.getComments().stream()
                .map(c -> new PostDetailDto.CommentDto(
                        c.getId(), c.getAuthorUsername(), c.getBody(), c.getCreatedAt()))
                .toList();
        return new PostDetailDto(
                post.getId(),
                post.getTitle(),
                post.getBody(),
                post.getAuthorUsername(),
                post.getCreatedAt(),
                comments);
    }

    @Transactional
    public PostSummaryDto createPost(String userEmail, PostCreateRequest req) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Post post = new Post();
        post.setUser(user);
        post.setTitle(req.title().trim());
        post.setBody(req.body().trim());
        post.setAuthorUsername(user.getUsername());
        post.setCreatedAt(Instant.now());
        post = postRepository.save(post);
        return new PostSummaryDto(post.getId(), post.getTitle(), post.getAuthorUsername(), post.getCreatedAt());
    }

    @Transactional
    public PostDetailDto.CommentDto addComment(String userEmail, Long postId, CommentCreateRequest req) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        PostComment c = new PostComment();
        c.setPost(post);
        c.setUser(user);
        c.setAuthorUsername(user.getUsername());
        c.setBody(req.body().trim());
        c.setCreatedAt(Instant.now());
        post.getComments().add(c);
        postRepository.save(post);
        return new PostDetailDto.CommentDto(c.getId(), c.getAuthorUsername(), c.getBody(), c.getCreatedAt());
    }
}
