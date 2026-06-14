package com.miempresa.backend_tfg.entity;

import com.miempresa.backend_tfg.model.Level;
import com.miempresa.backend_tfg.model.LessonResourceType;
import jakarta.persistence.*;

@Entity
@Table(name = "lessons")
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", nullable = false, length = 20)
    private LessonResourceType resourceType = LessonResourceType.NEWS;

    /** Full text for news excerpts or song lyrics */
    @Column(name = "content_text", columnDefinition = "TEXT")
    private String contentText;

    /** PDF URL or external article link */
    @Column(name = "asset_url", length = 800)
    private String assetUrl;

    /** Legacy optional field; DB may still be NOT NULL — always persisted as at least "". */
    @Column(name = "youtube_video_id", length = 32, nullable = true)
    private String youtubeVideoId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 8)
    private Level level;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    public Lesson() {}

    @PrePersist
    @PreUpdate
    void defaults() {
        if (resourceType == null) {
            resourceType = LessonResourceType.NEWS;
        }
        if (youtubeVideoId == null || youtubeVideoId.isBlank()) {
            youtubeVideoId = "";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LessonResourceType getResourceType() { return resourceType; }
    public void setResourceType(LessonResourceType resourceType) { this.resourceType = resourceType; }
    public String getContentText() { return contentText; }
    public void setContentText(String contentText) { this.contentText = contentText; }
    public String getAssetUrl() { return assetUrl; }
    public void setAssetUrl(String assetUrl) { this.assetUrl = assetUrl; }
    public String getYoutubeVideoId() { return youtubeVideoId; }
    public void setYoutubeVideoId(String youtubeVideoId) { this.youtubeVideoId = youtubeVideoId; }
    public Level getLevel() { return level; }
    public void setLevel(Level level) { this.level = level; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
