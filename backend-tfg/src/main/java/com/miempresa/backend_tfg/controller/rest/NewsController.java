package com.miempresa.backend_tfg.controller.rest;

import com.miempresa.backend_tfg.dto.NewsArticleDto;
import com.miempresa.backend_tfg.service.NewsApiService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    private final NewsApiService newsApiService;

    public NewsController(NewsApiService newsApiService) {
        this.newsApiService = newsApiService;
    }

    /** Live headlines from NewsAPI.org (requires {@code app.newsapi.api-key}). */
    @GetMapping("/live")
    public List<NewsArticleDto> live() {
        return newsApiService.fetchTopHeadlines();
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of(
                "newsApiConfigured", newsApiService.isConfigured(),
                "hint", "Set environment variable NEWSAPI_KEY or app.newsapi.api-key in application.yml"
        );
    }
}
