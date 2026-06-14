package com.miempresa.backend_tfg.entity;

import com.miempresa.backend_tfg.model.Level;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress")
public class UserProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    /** Optional legacy reference to a Mongo quiz document */
    private String quizId;

    @Enumerated(EnumType.STRING)
    @Column(name = "practice_level", length = 8)
    private Level practiceLevel;

    private Integer score;
    private LocalDateTime completedAt;
    private Integer timeSpent;

    public UserProgress() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getQuizId() { return quizId; }
    public void setQuizId(String quizId) { this.quizId = quizId; }
    public Level getPracticeLevel() { return practiceLevel; }
    public void setPracticeLevel(Level practiceLevel) { this.practiceLevel = practiceLevel; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public Integer getTimeSpent() { return timeSpent; }
    public void setTimeSpent(Integer timeSpent) { this.timeSpent = timeSpent; }
}