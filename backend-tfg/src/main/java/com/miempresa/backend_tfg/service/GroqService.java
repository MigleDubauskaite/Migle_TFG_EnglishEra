package com.miempresa.backend_tfg.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class GroqService {

    private final RestClient restClient;
    private final String apiKey;

    private static final String MODEL = "llama-3.3-70b-versatile";
    private static final String SYSTEM_PROMPT =
            "You are an English learning assistant inside an English learning app. " +
            "Help users with English grammar, vocabulary, idioms, pronunciation and comprehension. " +
            "Keep answers clear, friendly and concise. " +
            "If the user writes in Spanish, answer in Spanish but always include the English explanation.";

    public GroqService(RestClient.Builder builder,
                       @Value("${groq.api-key:}") String apiKey) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
        this.restClient = builder
                .baseUrl("https://api.groq.com/openai/v1")
                .build();
    }

    public boolean isConfigured() {
        return !apiKey.isBlank();
    }

    public String chat(String userMessage) {
        if (!isConfigured()) return "AI assistant is not configured.";

        var messages = List.of(
                Map.of("role", "system", "content", SYSTEM_PROMPT),
                Map.of("role", "user",   "content", userMessage)
        );
        var requestBody = Map.of(
                "model",    MODEL,
                "messages", messages
        );

        try {
            GroqResponse response = restClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(GroqResponse.class);

            if (response != null && response.choices() != null && !response.choices().isEmpty()) {
                return response.choices().get(0).message().content();
            }
            return "No response from AI.";
        } catch (Exception e) {
            System.err.println("[GroqService] Error: " + e.getMessage());
            return "Error contacting AI service. Please try again.";
        }
    }

    // ── Internal records for deserialization ─────────────────────────────────
    private record GroqResponse(List<Choice> choices) {}
    private record Choice(Message message) {}
    private record Message(String content) {}
}
