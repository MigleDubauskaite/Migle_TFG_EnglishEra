package com.miempresa.backend_tfg.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "quizzes")
public class Quiz {
    @Id private String id;
    private String resourceId;
    private String title;
    private List<Question> questions;

    public Quiz() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }

    public static class Question {
        private String id;
        private String question;
        private List<String> options;
        private String correct;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }
        public String getCorrect() { return correct; }
        public void setCorrect(String correct) { this.correct = correct; }
    }
}