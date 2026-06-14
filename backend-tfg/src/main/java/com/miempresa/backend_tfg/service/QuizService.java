package com.miempresa.backend_tfg.service;

import com.miempresa.backend_tfg.dto.*;
import com.miempresa.backend_tfg.entity.Quiz;
import com.miempresa.backend_tfg.entity.User;
import com.miempresa.backend_tfg.entity.UserProgress;
import com.miempresa.backend_tfg.model.Level;
import com.miempresa.backend_tfg.repository.QuizJpaRepository;
import com.miempresa.backend_tfg.repository.UserProgressRepository;
import com.miempresa.backend_tfg.repository.UserRepository;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class QuizService {

    private static final int XP_PER_CORRECT = 10;

    private final QuizJpaRepository quizRepository;
    private final UserRepository userRepository;
    private final UserProgressRepository userProgressRepository;

    public QuizService(
            QuizJpaRepository quizRepository,
            UserRepository userRepository,
            UserProgressRepository userProgressRepository) {
        this.quizRepository = quizRepository;
        this.userRepository = userRepository;
        this.userProgressRepository = userProgressRepository;
    }

    public List<QuizPublicDto> randomQuestions(Level level, int limit, String type, List<Long> excludeIds) {
        List<Quiz> rows;
        boolean hasExcludes = excludeIds != null && !excludeIds.isEmpty();
        if (type != null && !type.isBlank()) {
            rows = hasExcludes
                ? quizRepository.findRandomByLevelAndTypeExcluding(level.name(), type.toUpperCase(), excludeIds, PageRequest.of(0, limit))
                : quizRepository.findRandomByLevelAndType(level.name(), type.toUpperCase(), PageRequest.of(0, limit));
        } else {
            rows = hasExcludes
                ? quizRepository.findRandomByLevelExcluding(level.name(), excludeIds, PageRequest.of(0, limit))
                : quizRepository.findRandomByLevel(level.name(), PageRequest.of(0, limit));
        }
        List<QuizPublicDto> out = new ArrayList<>();
        for (Quiz q : rows) {
            String qType = q.getQuestionType() != null ? q.getQuestionType().name() : "GRAMMAR";
            out.add(new QuizPublicDto(
                    q.getId(),
                    qType,
                    q.getPrompt(),
                    List.of(q.getOptA(), q.getOptB(), q.getOptC(), q.getOptD())));
        }
        return out;
    }

    public QuizStatsDto stats() {
        Map<String, Long> byLevel = new LinkedHashMap<>();
        long total = 0;
        for (Level l : Level.values()) {
            long c = quizRepository.countByLevel(l);
            byLevel.put(l.name(), c);
            total += c;
        }
        return new QuizStatsDto(total, byLevel);
    }

    @Transactional
    public QuizResultDto submit(String userEmail, QuizSubmitRequest request) {
        Level level = Level.valueOf(request.level().trim().toUpperCase());
        User user = userRepository.findByEmail(userEmail).orElseThrow();

        int correct = 0;
        int total = 0;
        List<QuizReviewItemDto> review = new ArrayList<>();

        if (request.answers() != null) {
            for (QuizSubmitRequest.QuizAnswerItem item : request.answers()) {
                Quiz q = quizRepository.findById(item.questionId()).orElse(null);
                if (q == null || q.getLevel() != level) continue;
                total++;
                boolean wasCorrect = item.selectedIndex() == q.getCorrectIndex();
                if (wasCorrect) correct++;
                review.add(new QuizReviewItemDto(
                        q.getPrompt(),
                        List.of(q.getOptA(), q.getOptB(), q.getOptC(), q.getOptD()),
                        item.selectedIndex(),
                        q.getCorrectIndex(),
                        wasCorrect));
            }
        }

        int xpEarned = correct * XP_PER_CORRECT;
        int newTotal = (user.getTotalXp() == null ? 0 : user.getTotalXp()) + xpEarned;
        Level newLevel = computeLevel(newTotal);
        user.setTotalXp(newTotal);
        user.setCurrentLevel(newLevel);
        userRepository.save(user);

        UserProgress progress = new UserProgress();
        progress.setUser(user);
        progress.setPracticeLevel(level);
        progress.setScore(correct);
        progress.setCompletedAt(LocalDateTime.now());
        progress.setQuizId("random-" + level.name());
        progress.setTimeSpent(null);
        userProgressRepository.save(progress);

        return new QuizResultDto(correct, total, xpEarned, newTotal, newLevel.name(), review);
    }

    /** Map accumulated XP to a CEFR level. */
    private static Level computeLevel(int xp) {
        if (xp >= 8000) return Level.C2;
        if (xp >= 5000) return Level.C1;
        if (xp >= 3000) return Level.B2;
        if (xp >= 1500) return Level.B1;
        if (xp >= 500)  return Level.A2;
        return Level.A1;
    }
}
