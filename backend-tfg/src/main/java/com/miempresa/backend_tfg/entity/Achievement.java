package com.miempresa.backend_tfg.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "achievements")
public class Achievement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String badgeUrl;

    public Achievement() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getBadgeUrl() { return badgeUrl; }
    public void setBadgeUrl(String badgeUrl) { this.badgeUrl = badgeUrl; }
}