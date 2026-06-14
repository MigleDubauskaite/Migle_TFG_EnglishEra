package com.miempresa.backend_tfg.config;

import com.miempresa.backend_tfg.entity.Event;
import com.miempresa.backend_tfg.entity.Lesson;
import com.miempresa.backend_tfg.entity.Post;
import com.miempresa.backend_tfg.entity.User;
import com.miempresa.backend_tfg.model.Level;
import com.miempresa.backend_tfg.model.LessonResourceType;
import com.miempresa.backend_tfg.repository.EventRepository;
import com.miempresa.backend_tfg.repository.LessonRepository;
import com.miempresa.backend_tfg.repository.PostRepository;
import com.miempresa.backend_tfg.repository.QuizJpaRepository;
import com.miempresa.backend_tfg.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;

@Component
@Order(1)
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final QuizJpaRepository quizRepository;
    private final LessonRepository lessonRepository;
    private final PostRepository postRepository;
    private final EventRepository eventRepository;

    public DataLoader(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            QuizJpaRepository quizRepository,
            LessonRepository lessonRepository,
            PostRepository postRepository,
            EventRepository eventRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.quizRepository = quizRepository;
        this.lessonRepository = lessonRepository;
        this.postRepository = postRepository;
        this.eventRepository = eventRepository;
    }

    @Override
    public void run(String... args) {
        migratePlaintextPasswords();
        seedUsers();
        seedQuizzes();
        seedLessons();
        seedPosts();
        seedEvents();
    }

    private void migratePlaintextPasswords() {
        for (User u : userRepository.findAll()) {
            String p = u.getPassword();
            if (p != null && !p.startsWith("$2a") && !p.startsWith("$2b")) {
                u.setPassword(passwordEncoder.encode(p));
                userRepository.save(u);
            }
        }
    }

    private void seedUsers() {
        // Migrate admin@tfg.com → admin@gmail.com if needed
        userRepository.findByEmail("admin@tfg.com").ifPresent(u -> {
            u.setEmail("admin@gmail.com");
            u.setRole("ADMIN");
            userRepository.save(u);
        });
        // Create admin@gmail.com if it still doesn't exist
        if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@gmail.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            admin.setCurrentLevel(Level.C2);
            admin.setTotalXp(0);
            userRepository.save(admin);
        }
        if (userRepository.findByEmail("student@tfg.com").isEmpty()
                && !userRepository.existsByUsername("Ana")) {
            User s = new User();
            s.setUsername("Ana");
            s.setEmail("student@tfg.com");
            s.setPassword(passwordEncoder.encode("pass123"));
            s.setRole("USER");
            s.setCurrentLevel(Level.A1);
            s.setTotalXp(50);
            userRepository.save(s);
        } else {
            userRepository.findByEmail("student@tfg.com").ifPresent(u -> {
                if ("student1".equals(u.getUsername()) && !userRepository.existsByUsername("Ana")) {
                    u.setUsername("Ana");
                    userRepository.save(u);
                }
            });
        }
    }

    private void seedQuizzes() {
        QuizBulkSeeder.ensureQuestionCount(quizRepository, 480);
    }

    private void seedLessons() {
        if (lessonRepository.count() == 24) {
            return;
        }
        lessonRepository.deleteAll();

        int o = 1;
        addLesson(Level.A1, o++, LessonResourceType.NEWS, "Morning routines in the UK",
                "Short reading — daily life.",
                "Many people in the UK start the day with a cup of tea. Commuters often take the bus or the train. Schools begin around 9 a.m. A simple routine helps learners notice present simple verbs: get up, leave home, arrive, study.",
                null);
        addLesson(Level.A1, o++, LessonResourceType.LYRICS, "Twinkle, Twinkle, Little Star (excerpt)",
                "Classic nursery rhyme — easy repetition.",
                "Twinkle, twinkle, little star,\nHow I wonder what you are!\nUp above the world so high,\nLike a diamond in the sky.",
                null);
        addLesson(Level.A2, o++, LessonResourceType.NEWS, "City parks welcome spring visitors",
                "Local news style text.",
                "City parks reported more visitors this week. Families enjoyed picnics and short walks. Volunteers planted new trees. The weather stayed warm and sunny, perfect for outdoor English practice: describing places and activities.",
                null);
        addLesson(Level.A2, o++, LessonResourceType.LYRICS, "Row, Row, Row Your Boat (excerpt)",
                "Gentle rhythm for pronunciation.",
                "Row, row, row your boat,\nGently down the stream.\nMerrily, merrily, merrily, merrily,\nLife is but a dream.",
                null);
        addLesson(Level.B1, o++, LessonResourceType.NEWS, "Libraries add quiet study zones",
                "Reading for main ideas.",
                "Public libraries in several towns are adding quiet study zones for students. Wi-Fi is free, and staff organise weekly conversation clubs. Members say the new spaces help them focus on exams and English projects.",
                null);
        addLesson(Level.B1, o++, LessonResourceType.LYRICS, "Scarborough Fair (traditional, excerpt)",
                "Listen for imagery and old vocabulary.",
                "Are you going to Scarborough Fair?\nParsley, sage, rosemary and thyme.\nRemember me to one who lives there,\nShe once was a true love of mine.",
                null);
        addLesson(Level.B2, o++, LessonResourceType.NEWS, "Remote work changes meeting habits",
                "Opinion + fact mix.",
                "Companies say hybrid meetings are here to stay. Some managers prefer shorter calls; others worry about team spirit. Employees request clearer agendas and written summaries after each session.",
                null);
        addLesson(Level.B2, o++, LessonResourceType.LYRICS, "Auld Lang Syne (excerpt)",
                "Cultural song for celebrations.",
                "Should old acquaintance be forgot,\nAnd never brought to mind?\nShould old acquaintance be forgot,\nAnd auld lang syne!",
                null);
        addLesson(Level.C1, o++, LessonResourceType.NEWS, "Debate on screen time and teenagers",
                "Longer article — nuance.",
                "Educators disagree on how much screen time helps language learning. Some highlight authentic video input; others stress deep reading offline. A balanced approach often combines guided tasks with free exploration.",
                null);
        addLesson(Level.C1, o++, LessonResourceType.LYRICS, "Sonnet 18 (Shakespeare, excerpt)",
                "Public-domain poetry — imagery and old forms.",
                "Shall I compare thee to a summer's day?\nThou art more lovely and more temperate:\nRough winds do shake the darling buds of May,\nAnd summer's lease hath all too short a date:",
                null);
        addLesson(Level.C2, o++, LessonResourceType.NEWS, "Editorial: language and identity",
                "Dense text for close reading.",
                "Fluency is not only accuracy; it is also the confidence to choose register wisely. Minoritized communities often navigate multiple codes in a single day. Classrooms that honour this reality build safer spaces for risk-taking and growth.",
                null);
        addLesson(Level.C2, o++, LessonResourceType.LYRICS, "Ozymandias (Shelley, excerpt)",
                "Public-domain poem — tone and metaphor.",
                "I met a traveller from an antique land,\nWho said — \"Two vast and trunkless legs of stone\nStand in the desert. . . . Near them, on the sand,\nHalf sunk a shattered visage lies, whose frown,",
                null);
        // --- YouTube videos (2 per level) ---
        seedVideoLessons(o);
    }

    private void seedVideoLessons(int startOrder) {
        int o = startOrder;

        // A1
        addVideoLesson(Level.A1, o++,
                "Make or Do? — English with Lucy",
                "One of the most common confusions in English. Lucy explains the difference with clear examples perfect for beginners.",
                "xianU0IrxEk");
        addVideoLesson(Level.A1, o++,
                "Learn English with Anne with an E — TV Series",
                "Natural everyday expressions from the beloved series Anne with an E. Great for picking up simple, warm vocabulary.",
                "4rX4sH8PMFc");

        // A2
        addVideoLesson(Level.A2, o++,
                "10 Great TV Series to Learn English",
                "Discover which shows are best for A2 learners and why — explained by an English teacher.",
                "4K9zbx-W8U4");
        addVideoLesson(Level.A2, o++,
                "Learn English with The Chronicles of Narnia",
                "Classic fantasy vocabulary and natural British expressions, broken down scene by scene.",
                "BJ2VqM1V_hQ");

        // B1
        addVideoLesson(Level.B1, o++,
                "Learn English with Wednesday & Enid — Netflix",
                "Real dialogue from Wednesday on Netflix. Understand sarcasm, tone and informal register used by teenagers.",
                "hgdwTELjrNI");
        addVideoLesson(Level.B1, o++,
                "7 Best TV Series to Learn English in 2025",
                "Updated guide to the best shows for intermediate learners, with tips on what to pay attention to.",
                "JteHl9PQEIU");

        // B2
        addVideoLesson(Level.B2, o++,
                "Learn English with SEVERANCE — Award-Winning Series",
                "Professional and nuanced vocabulary from SEVERANCE. Perfect for understanding workplace language and subtle humour.",
                "-kXpw-AcEoM");
        addVideoLesson(Level.B2, o++,
                "Luke's English Podcast — Your English in 2024",
                "Luke Thompson gives a natural, unscripted episode on how to take your English to the next level. Authentic British speech.",
                "XNlEn9OS0E4");

        // C1
        addVideoLesson(Level.C1, o++,
                "20 Stunningly Beautiful English Idioms — English with Lucy",
                "Advanced idioms that will make your English sound elegant and expressive. Great for C1 writing and speaking.",
                "352CGJZmeeQ");
        addVideoLesson(Level.C1, o++,
                "Luke's English Podcast — Learning English in 2025",
                "An in-depth episode on habits, strategies and nuances for taking English to a near-native level.",
                "7e6013IJtXU");

        // C2
        addVideoLesson(Level.C2, o++,
                "All the Advanced Vocabulary You Need — English with Lucy",
                "90-minute deep dive into C2 vocabulary: collocations, register, and subtle word choices that native speakers make.",
                "kotoNOAvNGk");
        addVideoLesson(Level.C2, o,
                "5 Great TV Series to Learn English in 2025 (+ 5 Bonus!)",
                "For mastery-level learners: the most linguistically rich series of 2025, with analysis of what makes them exceptional for language study.",
                "U3bMcJj4ORQ");
    }

    private void addVideoLesson(Level level, int sortOrder, String title, String description, String youtubeVideoId) {
        Lesson l = new Lesson();
        l.setLevel(level);
        l.setSortOrder(sortOrder);
        l.setResourceType(LessonResourceType.VIDEO);
        l.setTitle(title);
        l.setDescription(description);
        l.setContentText(null);
        l.setAssetUrl(null);
        l.setYoutubeVideoId(youtubeVideoId);
        lessonRepository.save(l);
    }

    private void addLesson(
            Level level,
            int sortOrder,
            LessonResourceType type,
            String title,
            String description,
            String contentText,
            String assetUrl) {
        Lesson l = new Lesson();
        l.setLevel(level);
        l.setSortOrder(sortOrder);
        l.setResourceType(type);
        l.setTitle(title);
        l.setDescription(description);
        l.setContentText(contentText);
        l.setAssetUrl(assetUrl);
        l.setYoutubeVideoId("");
        lessonRepository.save(l);
    }

    private void seedEvents() {
        // Re-seed whenever we have fewer events than the full catalogue.
        // Bump the threshold when new events are added.
        if (eventRepository.count() >= 8) return;
        eventRepository.deleteAll();

        addEvent("English Conversation Evening — Madrid",
                "A relaxed evening to practise spoken English with fellow learners. No preparation needed — just show up and chat! Topics this month: travel and cultural differences.",
                "TALK", "Café Berlín, Calle Jacometrezo 4, Madrid", false, LocalDate.of(2026, 6, 13));

        addEvent("Book Club: 'The Alchemist' in English",
                "We read Paulo Coelho's 'The Alchemist' in its original English edition and discuss themes, vocabulary, and expressions together. Perfect for B1–B2 learners.",
                "BOOK_CLUB", "Librería La Central, Barcelona", false, LocalDate.of(2026, 6, 20));

        addEvent("Spoken English Meetup — Sevilla",
                "Drop in and practise your spoken English in a friendly, no-pressure setting. This month's topic: habits and routines. All levels welcome from A2 upward.",
                "TALK", "El Garlochí, Calle Boteros 26, Sevilla", false, LocalDate.of(2026, 6, 25));

        addEvent("Online Debate: Is social media good for language learning?",
                "Join this online structured debate in English. You'll be assigned a position and argue your case. Great speaking practice for B2–C1 levels.",
                "TALK", "Online (Zoom link sent on registration)", true, LocalDate.of(2026, 6, 27));

        addEvent("Film Night: 'About Time' — British accents & expressions",
                "We watch 'About Time' (2013) together and pause to analyse British expressions, accents, and humour. Subtitles available in English only.",
                "FILM", "CoWork Space, Calle Fuencarral 18, Madrid", false, LocalDate.of(2026, 7, 4));

        addEvent("English on the Coast — Málaga Conversation Walk",
                "A guided walk along the Paseo Marítimo with conversation prompts at each stop. Perfect for practising descriptive language and small talk in an outdoor setting.",
                "TRAVEL", "Paseo Marítimo Pablo Ruiz Picasso, Málaga", false, LocalDate.of(2026, 7, 9));

        addEvent("English Through Travel: Stories from India",
                "Three travellers share their experiences in India — entirely in English. Includes Q&A. A great way to absorb natural storytelling language.",
                "TRAVEL", "Centro Cultural La Corrala, Madrid", false, LocalDate.of(2026, 7, 11));

        addEvent("Online Workshop: Pronunciation & Intonation Secrets",
                "A live online session focused on the most common Spanish-speaker pronunciation mistakes in English, with exercises and instant feedback.",
                "TALK", "Online (Google Meet)", true, LocalDate.of(2026, 7, 18));
    }

    private void addEvent(String title, String description, String category, String location, boolean online, LocalDate date) {
        Event e = new Event();
        e.setTitle(title);
        e.setDescription(description);
        e.setCategory(category);
        e.setLocation(location);
        e.setOnline(online);
        e.setEventDate(date);
        e.setCreatedAt(Instant.now());
        e.setCreatedBy("admin");
        eventRepository.save(e);
    }

    private void seedPosts() {
        if (postRepository.count() > 0) {
            return;
        }
        Post p1 = new Post();
        p1.setTitle("Welcome to the English learning blog");
        p1.setBody("This space shares short articles about grammar, vocabulary, and culture. "
                + "Read a post, leave a comment, and keep practising every day.");
        p1.setAuthorUsername("admin");
        p1.setCreatedAt(Instant.now());
        postRepository.save(p1);

        Post p2 = new Post();
        p2.setTitle("Five quick tips for learning vocabulary");
        p2.setBody("1) Learn words in short phrases. 2) Review little and often. 3) Use new words in a sentence. "
                + "4) Mix reading and listening. 5) Celebrate small wins.");
        p2.setAuthorUsername("admin");
        p2.setCreatedAt(Instant.now());
        postRepository.save(p2);
    }
}
