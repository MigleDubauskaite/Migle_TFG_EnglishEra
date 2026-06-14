import { useEffect, useState } from 'react';
import { apiGet } from '../api/client';
import type { Lesson, NewsArticle } from '../types/api';

const PDF_BASE = 'http://localhost:8080';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const TABS = ['ALL', 'NEWS', 'LYRICS', 'PDF', 'VIDEO'] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  ALL: 'All types',
  NEWS: 'News',
  LYRICS: 'Lyrics',
  PDF: 'PDF',
  VIDEO: 'Video',
};

function getStoredLevel(): string {
  try {
    const raw = localStorage.getItem('loggedUser') ?? sessionStorage.getItem('loggedUser');
    if (!raw) return 'A1';
    const o = JSON.parse(raw) as { currentLevel?: string };
    return o.currentLevel?.trim() || 'A1';
  } catch {
    return 'A1';
  }
}

const ResourcesPage = () => {
  const [level, setLevel] = useState<string>(getStoredLevel);
  const [tab, setTab] = useState<Tab>('ALL');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [liveNews, setLiveNews] = useState<NewsArticle[]>([]);
  const [newsConfigured, setNewsConfigured] = useState<boolean | null>(null);
  const [visibleNews, setVisibleNews] = useState(3);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const typeParam = tab === 'ALL' ? '' : tab;
        const q = typeParam ? `&type=${encodeURIComponent(typeParam)}` : '';
        const data = await apiGet<Lesson[]>(
          `/api/lessons?level=${encodeURIComponent(level)}${q}`,
          false
        );
        if (!cancelled) setLessons(data);
      } catch {
        if (!cancelled) setError('Could not load materials.');
      }
    })();
    return () => { cancelled = true; };
  }, [level, tab]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [articles, status] = await Promise.all([
          apiGet<NewsArticle[]>('/api/news/live', false),
          apiGet<{ newsApiConfigured: boolean }>('/api/news/status', false),
        ]);
        if (!cancelled) {
          setLiveNews(articles);
          setNewsConfigured(status.newsApiConfigured);
        }
      } catch {
        if (!cancelled) {
          setLiveNews([]);
          setNewsConfigured(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-black text-stone-900">Reading materials</h1>
      <p className="mt-3 text-stone-500 max-w-2xl leading-relaxed">
        News-style texts, song lyrics, and PDF links — filtered by level. Live headlines from{' '}
        <strong className="text-stone-700">NewsAPI.org</strong> appear below when your backend has an API key set.
      </p>

      {error && <p className="mt-4 text-coral font-semibold text-sm">{error}</p>}

      {/* Live news */}
      <section className="mt-10 rounded-3xl bg-teal border-2 border-teal p-6 md:p-8 shadow-sm">
        <h2 className="text-base font-black text-stone-900 uppercase tracking-wide text-sm">Live news</h2>
        {newsConfigured === false && (
          <p className="mt-2 text-sm text-stone-500">
            No API key configured. Set <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">NEWSAPI_KEY</code> in the Spring app to load English headlines here.
          </p>
        )}
        {liveNews.length === 0 && newsConfigured && (
          <p className="mt-2 text-sm text-stone-500">No articles returned right now. Try again later.</p>
        )}
        <ul className="mt-4 space-y-3">
          {liveNews.slice(0, visibleNews).map((a, i) => (
            <li
              key={`${a.url}-${i}`}
              className="rounded-2xl bg-white border border-steel/20 p-4 hover:border-steel transition-colors"
            >
              <a href={a.url} target="_blank" rel="noreferrer" className="font-bold text-stone-900 hover:text-navy transition-colors">
                {a.title}
              </a>
              {a.description && <p className="text-sm text-stone-500 mt-1 line-clamp-2">{a.description}</p>}
              <p className="text-xs text-stone-400 mt-2">
                {a.source || 'Source'} &middot; {a.publishedAt ? new Date(a.publishedAt).toLocaleString() : ''}
              </p>
            </li>
          ))}
        </ul>
        {visibleNews < liveNews.length && (
          <button
            onClick={() => setVisibleNews(v => v + 3)}
            className="mt-4 w-full rounded-2xl border-2 border-navy text-navy font-bold text-sm py-2.5 hover:bg-navy hover:text-white transition-colors"
          >
            Load more
          </button>
        )}
      </section>

      {/* Level + type filters */}
      <div className="mt-12 flex flex-wrap gap-3 items-center">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Level</span>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="rounded-full border-2 border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-900 outline-none focus:border-navy transition-colors"
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
              tab === t
                ? 'bg-navy text-white shadow-sm'
                : 'bg-white text-stone-600 border-2 border-stone-200 hover:border-steel hover:text-navy'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Lessons list */}
      <div className="mt-10 space-y-6">
        {lessons.map((lesson) => (
          <article
            key={lesson.id}
            className="rounded-3xl border-2 border-stone-200 bg-white shadow-sm overflow-hidden hover:border-steel hover:shadow-md transition-all"
          >
            {/* Accent strip */}
            <div className={`h-1.5 w-full ${
              lesson.resourceType === 'PDF' ? 'bg-navy' :
              lesson.resourceType === 'VIDEO' ? 'bg-steel' :
              lesson.resourceType === 'LYRICS' ? 'bg-peach' :
              'bg-mint'
            }`} />
            <div className="p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-xl md:text-2xl font-black text-stone-900">{lesson.title}</h2>
              <div className="flex items-center gap-2 shrink-0">
                <span className="rounded-full bg-navy text-white px-3 py-1 text-xs font-black">
                  {lesson.level}
                </span>
                <span className="rounded-full bg-steel/20 text-navy px-3 py-1 text-xs font-bold">
                  {lesson.resourceType}
                </span>
              </div>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed">{lesson.description}</p>

            {lesson.resourceType === 'PDF' && lesson.assetUrl && (
              <div className="mt-6">
                <a
                  href={lesson.assetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full bg-navy text-white px-6 py-3 text-sm font-bold hover:bg-navy/85 transition-colors"
                >
                  Open PDF
                </a>
              </div>
            )}

            {lesson.resourceType === 'VIDEO' && lesson.youtubeVideoId && lesson.youtubeVideoId.length > 0 && (
              <div className="mt-6 rounded-2xl overflow-hidden border-2 border-stone-200 shadow-sm">
                <iframe
                  width="100%"
                  height="360"
                  src={`https://www.youtube.com/embed/${lesson.youtubeVideoId}`}
                  title={lesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ display: 'block' }}
                />
              </div>
            )}

            {lesson.contentText && (
              <div
                className={`mt-6 rounded-2xl p-5 text-stone-700 leading-relaxed whitespace-pre-wrap text-sm ${
                  lesson.resourceType === 'LYRICS'
                    ? 'bg-peach/20 border border-peach/40 font-medium'
                    : 'bg-teal/30 border border-teal'
                }`}
              >
                {lesson.contentText}
              </div>
            )}
            </div>
          </article>
        ))}
        {lessons.length === 0 && !error && (
          <p className="text-stone-400 text-center py-12">Nothing in this filter yet — try another level or type.</p>
        )}
      </div>

      {/* ── External resources ── */}
      <section className="mt-16">
        <p className="text-xs font-bold uppercase tracking-widest text-navy/50 mb-3">Curated links</p>
        <h2 className="text-2xl font-black text-stone-900 mb-8">More resources across the web</h2>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Practice & Tests */}
          <div className="rounded-3xl bg-teal border-2 border-teal p-6 shadow-sm sm:col-span-2">
            <p className="text-xs font-black text-navy uppercase tracking-wide mb-4">Practice &amp; Tests</p>
            <ul className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  title: 'English Practice (A1–C2)',
                  desc: 'Grammar and vocabulary exercises for every CEFR level — completely free.',
                  url: 'http://www.english-practice.at/index.htm',
                },
                {
                  title: 'TrackTest B2 Practice Paper',
                  desc: 'Full B2 level practice exam with answer key — great for self-assessment.',
                  url: 'https://tracktest.eu/download/english-tests/B2-English-test-with-answers.pdf',
                },
                {
                  title: 'Exam English',
                  desc: 'Free practice tests for IELTS, TOEFL, Cambridge and more.',
                  url: 'https://www.examenglish.com/index.html',
                },
              ].map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noreferrer"
                    className="group flex flex-col gap-0.5 hover:opacity-80 transition-opacity">
                    <span className="font-bold text-stone-900 text-sm group-hover:text-navy transition-colors">{r.title}</span>
                    <span className="text-xs text-stone-400 leading-relaxed">{r.desc}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Learning Platforms */}
          <div className="rounded-3xl bg-navy/5 border-2 border-navy/10 p-6 shadow-sm">
            <p className="text-xs font-black text-navy uppercase tracking-wide mb-4">Learning Platforms</p>
            <ul className="space-y-3">
              {[
                {
                  title: 'British Council — Learn English',
                  desc: 'Grammar, listening, reading and speaking practice from the British Council.',
                  url: 'https://learnenglish.britishcouncil.org/',
                },
                {
                  title: 'EnglishClass101 — Learn with PDF',
                  desc: 'Free downloadable PDF lessons covering grammar, vocabulary and phrases for all levels.',
                  url: 'https://www.englishclass101.com/learn-with-pdf',
                },
                {
                  title: 'Campus Bernat i Ferrer',
                  desc: 'Course materials and shared resources from the school campus.',
                  url: 'https://www.campus.bernatelferrer.cat/mod/folder/view.php?id=70028',
                },
              ].map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noreferrer"
                    className="group flex flex-col gap-0.5 hover:opacity-80 transition-opacity">
                    <span className="font-bold text-stone-900 text-sm group-hover:text-navy transition-colors">{r.title}</span>
                    <span className="text-xs text-stone-400 leading-relaxed">{r.desc}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Grammar */}
          <div className="rounded-3xl bg-teal border-2 border-teal p-6 shadow-sm">
            <p className="text-xs font-black text-navy uppercase tracking-wide mb-4">Grammar</p>
            <ul className="space-y-3">
              {[
                {
                  title: 'Perfect English Grammar',
                  desc: 'Clear explanations and free exercises for every grammar point.',
                  url: 'https://www.perfect-english-grammar.com/',
                },
                {
                  title: 'English Prepositions List (PDF)',
                  desc: 'Complete reference list of English prepositions with usage rules and examples.',
                  url: `${PDF_BASE}/english-prepositions-list.pdf`,
                },
              ].map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noreferrer"
                    className="group flex flex-col gap-0.5 hover:opacity-80 transition-opacity">
                    <span className="font-bold text-stone-900 text-sm group-hover:text-navy transition-colors">{r.title}</span>
                    <span className="text-xs text-stone-400 leading-relaxed">{r.desc}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Pronunciation */}
          <div className="rounded-3xl bg-mint/20 border-2 border-mint/40 p-6 shadow-sm">
            <p className="text-xs font-black text-navy uppercase tracking-wide mb-4">Pronunciation</p>
            <ul className="space-y-3">
              {[
                {
                  title: 'Minimal Pairs with Audio (PDF)',
                  desc: 'Practice distinguishing similar English sounds with audio-referenced minimal pair exercises.',
                  url: `${PDF_BASE}/minimal-pairs-with-audio.pdf`,
                },
              ].map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noreferrer"
                    className="group flex flex-col gap-0.5 hover:opacity-80 transition-opacity">
                    <span className="font-bold text-stone-900 text-sm group-hover:text-navy transition-colors">{r.title}</span>
                    <span className="text-xs text-stone-400 leading-relaxed">{r.desc}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Vocabulary */}
          <div className="rounded-3xl bg-peach/30 border-2 border-peach/50 p-6 shadow-sm">
            <p className="text-xs font-black text-navy uppercase tracking-wide mb-4">Vocabulary</p>
            <ul className="space-y-3">
              {[
                {
                  title: 'Essential Business Words (PDF)',
                  desc: 'Key vocabulary for professional contexts — emails, meetings, presentations and reports.',
                  url: `${PDF_BASE}/essential-business-words.pdf`,
                },
                {
                  title: 'Cambridge PET Vocabulary List (PDF)',
                  desc: 'Official Cambridge B1 word list covering all topics tested in the PET exam.',
                  url: `${PDF_BASE}/84669-pet-vocabulary-list.pdf`,
                },
                {
                  title: 'CEFR Vocabulary PDFs — LanGeek',
                  desc: 'Downloadable vocabulary lists organised by CEFR level (A1–C2) with example sentences.',
                  url: 'https://help.langeek.co/cefr-english-vocabulary-pdf/',
                },
                {
                  title: 'Vocabulary for Business English',
                  desc: 'Curated business expressions, collocations and idioms for professional settings.',
                  url: 'https://www.nativos.org/en/blog/vocabulary-for-business-english/',
                },
                {
                  title: 'IT Vocabulary EN–ES (PDF)',
                  desc: 'Free PDF guide to computing and technology vocabulary in English and Spanish.',
                  url: 'https://ecompass.es/wp-content/uploads/Aprende-Vocabulario-de-Inform%C3%A1tica-Ingl%C3%A9s-Espa%C3%B1ol.pdf',
                },
                {
                  title: 'IELTS Technology Vocabulary',
                  desc: 'Topic-specific vocabulary list for IELTS essays on technology.',
                  url: 'https://ieltsliz.com/',
                },
              ].map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noreferrer"
                    className="group flex flex-col gap-0.5 hover:opacity-80 transition-opacity">
                    <span className="font-bold text-stone-900 text-sm group-hover:text-navy transition-colors">{r.title}</span>
                    <span className="text-xs text-stone-400 leading-relaxed">{r.desc}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Dictionary */}
          <div className="rounded-3xl bg-sage border-2 border-sage p-6 shadow-sm">
            <p className="text-xs font-black text-navy uppercase tracking-wide mb-4">Dictionary</p>
            <ul className="space-y-3">
              {[
                {
                  title: 'Cambridge Dictionary',
                  desc: 'The gold standard for English definitions, examples, and pronunciation.',
                  url: 'https://dictionary.cambridge.org/',
                },
              ].map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noreferrer"
                    className="group flex flex-col gap-0.5 hover:opacity-80 transition-opacity">
                    <span className="font-bold text-stone-900 text-sm group-hover:text-navy transition-colors">{r.title}</span>
                    <span className="text-xs text-stone-400 leading-relaxed">{r.desc}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Books */}
          <div className="rounded-3xl bg-cream border-2 border-sun/30 p-6 shadow-sm sm:col-span-2">
            <p className="text-xs font-black text-navy uppercase tracking-wide mb-4">Books &amp; Readers</p>
            <ul className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  title: 'English for Everyone — Level 1 Beginner (PDF)',
                  desc: "DK's visual course book for complete beginners. Basic grammar, vocabulary and conversations.",
                  url: `${PDF_BASE}/English-for-Everyone.-Level-1-Beginner.-Course-Book.-2016-184p.-min.pdf`,
                },
                {
                  title: 'Complete English All-in-One for ESL Learners (PDF)',
                  desc: 'Comprehensive reference covering grammar, writing, reading and speaking for all levels.',
                  url: `${PDF_BASE}/Complete-English-All-in-One-for-ESL-Learners-Book.pdf`,
                },
                {
                  title: 'Learn English in Seven (PDF)',
                  desc: 'A structured seven-step guide to mastering key English skills with practical exercises.',
                  url: `${PDF_BASE}/learn-english-in-seven.pdf`,
                },
                {
                  title: 'Standard Ebooks',
                  desc: 'Beautifully formatted, free and legal public-domain ebooks — Austen, Dickens, Orwell and more.',
                  url: 'https://standardebooks.org/ebooks',
                },
                {
                  title: 'Public Domain Library',
                  desc: 'Thousands of free public-domain books in PDF and EPUB — great for extensive reading practice.',
                  url: 'https://publicdomainlibrary.org/en/',
                },
                {
                  title: 'National Geographic Learning — Adults',
                  desc: 'Official coursebook site with sample lessons, audio and video for adult learners.',
                  url: 'https://www.eltngl.com/segments/adults',
                },
              ].map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noreferrer"
                    className="group flex flex-col gap-0.5 hover:opacity-80 transition-opacity">
                    <span className="font-bold text-stone-900 text-sm group-hover:text-navy transition-colors">{r.title}</span>
                    <span className="text-xs text-stone-400 leading-relaxed">{r.desc}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Videos ── */}
      <section className="mt-16">
        <p className="text-xs font-bold uppercase tracking-widest text-navy/50 mb-3">Watch &amp; learn</p>
        <h2 className="text-2xl font-black text-stone-900 mb-8">Videos — Learn with Movies</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              id: '97fxGkWqBCc',
              title: 'Learn English With Movies — Shrek',
              desc: 'Vocabulary, expressions and humour from Shrek explained for English learners. Great for B1–B2.',
            },
          ].map((v) => (
            <div key={v.id} className="rounded-3xl border-2 border-stone-200 bg-white shadow-sm overflow-hidden">
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${v.id}`}
                  title={v.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <p className="font-black text-stone-900 text-sm">{v.title}</p>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Songs & Lyrics ── */}
      <section className="mt-12">
        <p className="text-xs font-bold uppercase tracking-widest text-navy/50 mb-3">Music</p>
        <h2 className="text-2xl font-black text-stone-900 mb-8">Songs &amp; Lyrics</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              id: 'axS6L0NX7VE',
              title: 'Imagine Dragons — Next To Me',
              desc: 'Follow the lyrics to practise pronunciation, rhythm and natural English phrasing.',
            },
            {
              id: 'UbrUd6VWE3Q',
              title: 'Doja Cat — Paint The Town Red',
              desc: 'High-energy track with vivid vocabulary and idiomatic expressions.',
            },
            {
              id: '_PyI4jFbX38',
              title: 'Faouzia — UNETHICAL',
              desc: 'Powerful vocals and expressive language — great for emotional and descriptive vocabulary.',
            },
          ].map((v) => (
            <div key={v.id} className="rounded-3xl border-2 border-stone-200 bg-white shadow-sm overflow-hidden">
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${v.id}`}
                  title={v.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <p className="font-black text-stone-900 text-sm">{v.title}</p>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ResourcesPage;
