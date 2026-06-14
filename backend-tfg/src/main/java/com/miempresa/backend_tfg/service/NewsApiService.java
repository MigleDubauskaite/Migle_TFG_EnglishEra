package com.miempresa.backend_tfg.service;

import com.miempresa.backend_tfg.dto.NewsArticleDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.List;

@Service
public class NewsApiService {

    private final RestClient restClient;
    private final String apiKey;

    public NewsApiService(RestClient.Builder builder, @Value("${app.newsapi.api-key:}") String apiKey) {
        this.restClient = builder.baseUrl("https://newsapi.org/v2").build();
        this.apiKey = apiKey == null ? "" : apiKey.trim();
    }

    // ESTO ES LO QUE FALTABA:
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public List<NewsArticleDto> fetchTopHeadlines() {
        if (!isConfigured()) return List.of();

        try {
            NewsResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/top-headlines")
                            .queryParam("country", "us")
                            .queryParam("pageSize", 100)
                            .queryParam("apiKey", apiKey)
                            .build())
                    .retrieve()
                    .body(NewsResponse.class);

            if (response == null || response.articles() == null) return List.of();
            return response.articles().stream()
                    .map(a -> new NewsArticleDto(
                            a.title(),
                            a.description(),
                            a.url(),
                            a.publishedAt(),
                            a.source() != null ? a.source().name() : null
                    ))
                    .toList();
        } catch (Exception e) {
            System.err.println("[NewsApiService] Error fetching headlines: " + e.getMessage());
            return List.of();
        }
    }

    // Clases internas para deserializar la respuesta de NewsAPI
    private record NewsResponse(List<RawArticle> articles) {}
    private record RawArticle(String title, String description, String url, String publishedAt, RawSource source) {}
    private record RawSource(String id, String name) {}
}