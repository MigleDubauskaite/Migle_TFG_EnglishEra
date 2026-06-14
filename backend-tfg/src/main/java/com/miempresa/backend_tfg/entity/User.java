package com.miempresa.backend_tfg.entity;

import com.miempresa.backend_tfg.model.Level;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
	
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Level currentLevel;

    private Integer totalXp = 0;

    private String role; // "USER" o "ADMIN"

    public User() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Level getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(Level currentLevel) { this.currentLevel = currentLevel; }
    public Integer getTotalXp() { return totalXp; }
    public void setTotalXp(Integer totalXp) { this.totalXp = totalXp; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}