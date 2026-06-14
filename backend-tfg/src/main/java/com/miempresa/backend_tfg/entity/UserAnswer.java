package com.miempresa.backend_tfg.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_answers")
public class UserAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "progress_id")
    private UserProgress progress;

    private String questionId;
    private String userAnswer;
    private Boolean isCorrect;

    public UserAnswer() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UserProgress getProgress() { return progress; }
    public void setProgress(UserProgress progress) { this.progress = progress; }
    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }
    public String getUserAnswer() { return userAnswer; }
    public void setUserAnswer(String userAnswer) { this.userAnswer = userAnswer; }
    public Boolean getIsCorrect() { return isCorrect; }
    public void setIsCorrect(Boolean isCorrect) { this.isCorrect = isCorrect; }
}