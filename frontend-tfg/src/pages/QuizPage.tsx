import { useMemo, useRef, useState } from 'react';
import { apiGet, apiPost } from '../api/client';
import type { QuizPublic, QuizResult } from '../types/api';

// ── localStorage quiz history ─────────────────────────────────────────────────
interface HistoryEntry {
  date: string;
  level: string;
  type: string;
  correct: number;
  total: number;
  xpEarned: number;
  review: QuizResult['review'];
}
const HISTORY_KEY = 'quizHistory';
function saveToHistory(entry: HistoryEntry) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const list: HistoryEntry[] = raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
    list.unshift(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 50)));
  } catch { /* non-critical */ }
}

// ── Option shuffling ──────────────────────────────────────────────────────────
// Server always puts the correct answer at index 0 (optA).
// We shuffle display options and track the mapping so submission sends the
// original index (0 = correct) regardless of display order.
interface ShuffledQuestion {
  id: number;
  questionType: string;
  prompt: string;
  displayOptions: string[];          // shuffled for display
  displayToOriginal: number[];       // displayIndex → original index
}

function shuffleQuestion(q: QuizPublic): ShuffledQuestion {
  const indices = [0, 1, 2, 3];
  // Fisher-Yates
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const displayOptions = indices.map(i => q.options[i]);
  return {
    id: q.id,
    questionType: q.questionType ?? 'MULTIPLE_CHOICE',
    prompt: q.prompt,
    displayOptions,
    displayToOriginal: indices,   // displayToOriginal[displayIdx] = originalIdx
  };
}

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
const COUNT_OPTIONS = [5, 10, 15] as const;

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

const QUIZ_TYPES = [
  {
    key: 'RANDOM',
    label: 'Random mix',
    description: 'Grammar, vocabulary, reading & idioms — all mixed together.',
  },
  {
    key: 'GRAMMAR',
    label: 'Grammar',
    description: 'Verb forms, tenses, conditionals, and sentence structure.',
  },
  {
    key: 'VOCABULARY',
    label: 'Vocabulary',
    description: 'Word meanings, opposites, definitions, and usage.',
  },
  {
    key: 'READING',
    label: 'Reading',
    description: 'Short sentence comprehension and inference questions.',
  },
  {
    key: 'IDIOMS',
    label: 'Idioms',
    description: 'Common English idioms and their real meanings.',
  },
] as const;

type QuizTypeKey = (typeof QUIZ_TYPES)[number]['key'];

const QuizPage = () => {
  const [level, setLevel] = useState<string>(getStoredLevel);
  const [count, setCount] = useState<number>(5);
  const [selectedType, setSelectedType] = useState<QuizTypeKey | null>(null);
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  // answers[questionId] = displayIndex selected by user
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [step, setStep] = useState(0);
  const [loadingType, setLoadingType] = useState<QuizTypeKey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tracks all question IDs seen in this browser session to avoid repeats
  const usedIdsRef = useRef<Set<number>>(new Set());

  const current = questions[step];
  const isLast = useMemo(() => step >= questions.length - 1, [step, questions.length]);

  const startRound = async (typeKey: QuizTypeKey) => {
    setLoadingType(typeKey);
    setSelectedType(typeKey);
    setError(null);
    setResult(null);
    setAnswers({});
    setStep(0);
    try {
      const typeParam = typeKey === 'RANDOM' ? '' : `&type=${typeKey}`;
      const excludeParam = usedIdsRef.current.size > 0
        ? `&excludeIds=${[...usedIdsRef.current].join(',')}`
        : '';
      const qs = await apiGet<QuizPublic[]>(
        `/api/quizzes/random?level=${encodeURIComponent(level)}&limit=${count}${typeParam}${excludeParam}`
      );
      if (qs.length === 0) {
        setError('No questions for this level and type yet.');
        setQuestions([]);
        setSelectedType(null);
        return;
      }
      // Add fetched IDs to the used set
      qs.forEach(q => usedIdsRef.current.add(q.id));
      // Shuffle each question's options
      setQuestions(qs.map(shuffleQuestion));
    } catch {
      setError('Could not load questions. Are you signed in?');
      setSelectedType(null);
    } finally {
      setLoadingType(null);
    }
  };

  const choose = (displayIndex: number) => {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: displayIndex }));
  };

  const prev = () => setStep((s) => Math.max(0, s - 1));

  const next = () => {
    if (isLast) submitRound();
    else setStep((s) => s + 1);
  };

  const submitRound = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        level,
        answers: questions.map((q) => {
          const displayIdx = answers[q.id] ?? -1;
          // Convert display index back to original index for server-side checking
          const originalIdx = displayIdx >= 0 ? q.displayToOriginal[displayIdx] : -1;
          return {
            questionId: q.id,
            selectedIndex: originalIdx,
          };
        }),
      };
      const res = await apiPost<QuizResult>('/api/quizzes/submit', payload);
      // Attach display-order review so the UI shows options as the user saw them
      const enrichedReview = (res.review ?? []).map((item, i) => {
        const q = questions[i];
        if (!q) return item;
        const displayIdx = answers[q.id] ?? -1;
        // Find where correct answer (original index 0) is in display order
        const correctDisplayIdx = q.displayToOriginal.indexOf(0);
        return {
          ...item,
          options: q.displayOptions,
          selectedIndex: displayIdx,
          correctIndex: correctDisplayIdx,
        };
      });
      const enrichedResult = { ...res, review: enrichedReview };
      setResult(enrichedResult);
      // Sync level in localStorage/sessionStorage so Resources & Quiz pages default correctly
      try {
        const raw = localStorage.getItem('loggedUser') ?? sessionStorage.getItem('loggedUser');
        if (raw && enrichedResult.newLevel) {
          const stored = JSON.parse(raw) as Record<string, unknown>;
          stored.currentLevel = enrichedResult.newLevel;
          const json = JSON.stringify(stored);
          if (localStorage.getItem('loggedUser')) localStorage.setItem('loggedUser', json);
          else sessionStorage.setItem('loggedUser', json);
        }
      } catch { /* ignore */ }
      saveToHistory({
        date: new Date().toISOString(),
        level,
        type: selectedType ?? 'RANDOM',
        correct: res.correct,
        total: res.total,
        xpEarned: res.xpEarned,
        review: enrichedReview,
      });
      setQuestions([]);
      setSelectedType(null);
    } catch {
      setError('Could not submit answers.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setResult(null);
    setSelectedType(null);
    setQuestions([]);
    setAnswers({});
    setStep(0);
    setError(null);
  };

  const resetAll = () => {
    reset();
    usedIdsRef.current.clear();
  };

  // ── RESULT SCREEN ──
  if (result) {
    const pct = Math.round((result.correct / result.total) * 100);
    const review = result.review ?? [];
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-black text-stone-900">Round complete</h1>

        {/* Score summary */}
        <div className="mt-6 rounded-3xl bg-cream border-2 border-sun/30 p-8 shadow-sm text-center space-y-4">
          <p className="text-6xl font-black text-navy">
            {result.correct}
            <span className="text-2xl text-stone-400 font-bold">/{result.total}</span>
          </p>
          <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
            <div className="h-2 rounded-full bg-steel transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-stone-500 font-semibold text-sm">
            +{result.xpEarned} XP earned &middot; Total: {result.newTotalXp} XP
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={reset}
              className="rounded-full bg-navy text-white font-bold px-8 py-3 text-sm hover:bg-navy/85 transition-colors"
            >
              Another round
            </button>
            <button
              onClick={resetAll}
              className="rounded-full border-2 border-stone-200 text-stone-600 font-bold px-8 py-3 text-sm hover:border-navy hover:text-navy transition-colors"
            >
              Reset &amp; start fresh
            </button>
          </div>
        </div>

        {/* Per-question review */}
        {review.length > 0 && (
          <div className="mt-10">
            <h2 className="text-sm font-black text-stone-900 uppercase tracking-wide mb-4">Review your answers</h2>
            <div className="space-y-4">
              {review.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-3xl border-2 p-6 ${
                    item.wasCorrect
                      ? 'border-mint/50 bg-mint/10'
                      : 'border-red-200 bg-red-50/60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${
                      item.wasCorrect ? 'bg-mint/30 text-navy' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.wasCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">
                      Question {idx + 1}
                    </span>
                  </div>
                  <p className="text-stone-900 font-semibold text-sm leading-snug mb-3">
                    {item.prompt}
                  </p>
                  <div className="grid gap-1.5">
                    {item.options.map((opt, oi) => {
                      const isCorrect = oi === item.correctIndex;
                      const isSelected = oi === item.selectedIndex;
                      let cls = 'border-stone-200 bg-white text-stone-500';
                      if (isCorrect) cls = 'border-mint bg-mint/15 text-navy font-semibold';
                      if (isSelected && !isCorrect) cls = 'border-red-300 bg-red-50 text-red-700 font-semibold';
                      return (
                        <div
                          key={oi}
                          className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2 text-sm ${cls}`}
                        >
                          <span className="font-bold text-xs w-4 shrink-0">
                            {String.fromCharCode(65 + oi)}.
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isCorrect && (
                            <span className="text-xs font-bold text-mint shrink-0">✓ correct</span>
                          )}
                          {isSelected && !isCorrect && (
                            <span className="text-xs font-bold text-red-500 shrink-0">your answer</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── ACTIVE QUIZ ──
  if (questions.length > 0 && current) {
    const typeInfo = QUIZ_TYPES.find(t => t.key === selectedType);
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={reset} className="text-stone-400 hover:text-navy font-semibold text-sm transition-colors">
            &larr; Back
          </button>
          <span className="rounded-full bg-steel/25 text-navy px-3 py-1 text-xs font-black">{level}</span>
          {typeInfo && <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">{typeInfo.label}</span>}
        </div>
        <div className="rounded-3xl bg-white border-2 border-stone-200 p-6 md:p-8 shadow-sm space-y-5">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-navy text-white px-3 py-1 font-black text-xs">
              {step + 1} / {questions.length}
            </span>
            <span className="text-stone-400 font-semibold text-xs uppercase tracking-wide">{current.questionType}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-1.5 rounded-full bg-steel transition-all duration-300"
              style={{ width: `${(step / questions.length) * 100}%` }}
            />
          </div>

          <p className="text-lg font-semibold text-stone-900 leading-snug">{current.prompt}</p>

          <div className="grid gap-2.5">
            {current.displayOptions.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => choose(idx)}
                className={`text-left px-4 py-3.5 rounded-2xl border-2 transition-all ${
                  answers[current.id] === idx
                    ? 'border-navy bg-navy/6 text-stone-900 shadow-sm'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-steel/80 hover:bg-steel/5'
                }`}
              >
                <span className="font-bold text-stone-400 mr-2.5 text-sm">{String.fromCharCode(65 + idx)}.</span>
                {opt}
              </button>
            ))}
          </div>

          {error && <p className="text-coral text-sm font-semibold">{error}</p>}

          <div className="flex gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={prev}
                className="rounded-2xl border-2 border-stone-200 text-stone-600 font-bold px-5 py-3.5 hover:border-navy hover:text-navy transition-colors"
              >
                ← Prev
              </button>
            )}
            <button
              type="button"
              disabled={isLast ? (answers[current.id] === undefined || submitting) : false}
              onClick={next}
              className="flex-1 rounded-2xl bg-navy text-white font-bold py-3.5 disabled:opacity-40 hover:bg-navy/85 transition-colors"
            >
              {isLast ? (submitting ? 'Submitting…' : 'Submit answers') : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── TYPE SELECTOR ──
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-black text-stone-900">Quizzes</h1>
      <p className="mt-2 text-stone-500">Choose a type and level, then start a round.</p>

      {error && <p className="mt-4 text-coral text-sm font-semibold">{error}</p>}

      {/* Level picker */}
      <div className="mt-8 flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-2">Level</span>
        {LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLevel(l)}
            className={`rounded-full px-4 py-2 text-sm font-bold border-2 transition-colors ${
              level === l
                ? 'bg-navy text-white border-navy shadow-sm'
                : 'bg-white text-stone-600 border-stone-200 hover:border-steel hover:text-navy'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Question count picker */}
      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-2">Questions</span>
        {COUNT_OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setCount(n)}
            className={`rounded-full px-4 py-2 text-sm font-bold border-2 transition-colors ${
              count === n
                ? 'bg-sun text-stone-900 border-sun shadow-sm'
                : 'bg-white text-stone-600 border-stone-200 hover:border-steel hover:text-navy'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Quiz type cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {/* Random — featured full-width */}
        <button
          type="button"
          disabled={loadingType !== null}
          onClick={() => startRound('RANDOM')}
          className="sm:col-span-2 text-left rounded-3xl border-2 border-navy bg-navy p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 hover:scale-[1.005] disabled:opacity-50"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xl font-black text-white">Random mix</p>
              <p className="mt-1.5 text-sm text-white/60 leading-relaxed">
                Grammar, vocabulary, reading & idioms — all mixed together.
              </p>
            </div>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white/90 shrink-0">
              {count} questions
            </span>
          </div>
          <span className="inline-block mt-4 text-sm font-bold text-white/70 border-b border-white/30 pb-0.5">
            {loadingType === 'RANDOM' ? 'Loading…' : 'Start round'}
          </span>
        </button>

        {/* Remaining types */}
        {QUIZ_TYPES.filter(qt => qt.key !== 'RANDOM').map((qt) => (
          <button
            key={qt.key}
            type="button"
            disabled={loadingType !== null}
            onClick={() => startRound(qt.key)}
            className="text-left rounded-3xl border-2 border-stone-200 bg-white p-6 shadow-sm hover:shadow-xl hover:border-steel hover:-translate-y-1 transition-all duration-200 hover:scale-[1.01] disabled:opacity-50"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-lg font-black text-stone-900">{qt.label}</p>
              <span className="rounded-full bg-steel/20 text-navy px-2.5 py-0.5 text-xs font-black shrink-0">{count}</span>
            </div>
            <p className="text-sm text-stone-500 leading-relaxed">{qt.description}</p>
            <span className="inline-block mt-4 text-sm font-bold text-navy border-b border-steel/60 pb-0.5">
              {loadingType === qt.key ? 'Loading…' : 'Start round'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizPage;
