package com.miempresa.backend_tfg.document;

import com.miempresa.backend_tfg.model.Level;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;
import java.time.LocalDate;

@Document(collection = "resources")
public class Resource {
    @Id
    private String id;
    private String title;
    private String type;
    private String url;
    private Level level;
    private List<String> tags;
    private String fileSize;
    private LocalDate createdAt;

    public Resource() {}

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getType() { return type; }
    public String getUrl() { return url; }
    public Level getLevel() { return level; }
    public List<String> getTags() { return tags; }
    public String getFileSize() { return fileSize; }
    public LocalDate getCreatedAt() { return createdAt; }

    public void setId(String id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setType(String type) { this.type = type; }
    public void setUrl(String url) { this.url = url; }
    public void setLevel(Level level) { this.level = level; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public void setFileSize(String fileSize) { this.fileSize = fileSize; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
}