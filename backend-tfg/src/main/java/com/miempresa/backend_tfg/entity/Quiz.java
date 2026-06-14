package com.miempresa.backend_tfg.entity;

import com.miempresa.backend_tfg.model.Level;
import com.miempresa.backend_tfg.model.QuizQuestionType;
import jakarta.persistence.*;

/**
 * One multiple-choice question for practice quizzes, filtered by {@link Level}.
 */
@Entity
@Table(name = "quizzes")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 8)
    private Level level;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false, length = 20)
    private QuizQuestionType questionType = QuizQuestionType.GRAMMAR;

    @Column(nullable = false, length = 500)
    private String prompt;

    @Column(name = "opt_a", nullable = false, length = 200)
    private String optA;

    @Column(name = "opt_b", nullable = false, length = 200)
    private String optB;

    @Column(name = "opt_c", nullable = false, length = 200)
    private String optC;

    @Column(name = "opt_d", nullable = false, length = 200)
    private String optD;

    /** Index 0–3 matching optA..optD */
    @Column(name = "correct_index", nullable = false)
    private int correctIndex;

    public Quiz() {}

    @PrePersist
    @PreUpdate
    void quizDefaults() {
        if (questionType == null) {
            questionType = QuizQuestionType.GRAMMAR;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Level getLevel() { return level; }
    public void setLevel(Level level) { this.level = level; }
    public QuizQuestionType getQuestionType() { return questionType; }
    public void setQuestionType(QuizQuestionType questionType) { this.questionType = questionType; }
    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }
    public String getOptA() { return optA; }
    public void setOptA(String optA) { this.optA = optA; }
    public String getOptB() { return optB; }
    public void setOptB(String optB) { this.optB = optB; }
    public String getOptC() { return optC; }
    public void setOptC(String optC) { this.optC = optC; }
    public String getOptD() { return optD; }
    public void setOptD(String optD) { this.optD = optD; }
    public int getCorrectIndex() { return correctIndex; }
    public void setCorrectIndex(int correctIndex) { this.correctIndex = correctIndex; }
}
