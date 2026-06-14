package com.miempresa.backend_tfg.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;
import java.time.LocalDate;

@Document(collection = "blog_posts")
public class BlogPost {
    @Id private String id;
    private String title;
    private String content;
    private String author;
    private List<String> tags;
    private String imageUrl;
    private LocalDate publishedAt;
    private List<Comment> comments;

    public BlogPost() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public LocalDate getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDate publishedAt) { this.publishedAt = publishedAt; }
    public List<Comment> getComments() { return comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }

    public static class Comment {
        private String user;
        private String text;
        private String date;

        public String getUser() { return user; }
        public void setUser(String user) { this.user = user; }
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
    }
}