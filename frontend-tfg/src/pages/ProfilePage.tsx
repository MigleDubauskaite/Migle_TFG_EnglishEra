import { useEffect, useState } from 'react';
import { apiGet } from '../api/client';
import type { UserProfile, QuizReviewItem } from '../types/api';

interface HistoryEntry {
  date: string;
  level: string;
  type: string;
  correct: number;
  total: number;
  xpEarned: number;
  review: QuizReviewItem[];
}
function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem('quizHistory');
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch { return []; }
}

const XP_THRESHOLDS: Record<string, { min: number; max: number; label: string }> = {
  A1: { min: 0,    max: 100,  label: 'Beginner' },
  A2: { min: 100,  max: 250,  label: 'Elementary' },
  B1: { min: 250,  max: 500,  label: 'Intermediate' },
  B2: { min: 500,  max: 800,  label: 'Upper-Int.' },
  C1: { min: 800,  max: 1200, label: 'Advanced' },
  C2: { min: 1200, max: 1200, label: 'Mastery' },
};

const LEVEL_STYLE: Record<string, { bg: string; text: string; bar: string; accent: string }> = {
  A1: { bg: 'bg-steel/20',      text: 'text-navy',       bar: 'bg-steel/60',  accent: 'border-steel/40' },
  A2: { bg: 'bg-steel/35',      text: 'text-navy',       bar: 'bg-steel',     accent: 'border-steel/60' },
  B1: { bg: 'bg-apricot/20',    text: 'text-stone-800',  bar: 'bg-apricot',   accent: 'border-apricot/40' },
  B2: { bg: 'bg-apricot/35',    text: 'text-stone-800',  bar: 'bg-apricot',   accent: 'border-apricot/60' },
  C1: { bg: 'bg-navy/80',       text: 'text-white',      bar: 'bg-navy',      accent: 'border-navy/50' },
  C2: { bg: 'bg-navy',          text: 'text-white',      bar: 'bg-sun',       accent: 'border-navy' },
};

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function xpProgress(level: string, totalXp: number): number {
  const t = XP_THRESHOLDS[level];
  if (!t || level === 'C2') return 100;
  return Math.min(100, Math.round(((Math.max(0, totalXp - t.min)) / (t.max - t.min)) * 100));
}

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history] = useState<HistoryEntry[]>(() => loadHistory());
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<UserProfile>('/api/users/me');
        setProfile(data);
      } catch {
        setError('Could not load profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-32"><p className="text-stone-400 font-semibold text-sm animate-pulse">Loading profile…</p></div>;
  }
  if (error || !profile) {
    return <div className="flex items-center justify-center py-32"><p className="text-coral font-semibold">{error ?? 'Profile not found.'}</p></div>;
  }

  const progress = xpProgress(profile.currentLevel, profile.totalXp);
  const next = LEVELS[LEVELS.indexOf(profile.currentLevel) + 1] ?? null;
  const threshold = XP_THRESHOLDS[profile.currentLevel];
  const lvlStyle = LEVEL_STYLE[profile.currentLevel] ?? LEVEL_STYLE.A1;
  const totalRounds = history.length;
  const avgScore = totalRounds > 0 ? Math.round(history.reduce((s, h) => s + (h.correct / h.total) * 100, 0) / totalRounds) : 0;
  const totalXpEarned = history.reduce((s, h) => s + h.xpEarned, 0);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">

      {/* ── HEADER CARD ── */}
      <div className="rounded-3xl bg-navy overflow-hidden shadow-lg mb-6 relative">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-steel/10 translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-sun/10 -translate-x-10 translate-y-10" />

        <div className="relative z-10 p-8 flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-steel/25 flex items-center justify-center shadow-lg border-2 border-steel/30 shrink-0">
            <span className="text-white text-3xl font-black">
              {profile.username.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <p className="text-2xl font-black text-white truncate">{profile.username}</p>
              {profile.role === 'ADMIN' && (
                <span className="rounded-full bg-sun text-stone-900 text-xs font-black px-3 py-1">Admin</span>
              )}
            </div>
            <p className="text-white/40 text-sm truncate">{profile.email}</p>

            {/* Level badge */}
            <div className="flex items-center gap-3 mt-4">
              <span className={`rounded-full px-4 py-1.5 text-sm font-black ${lvlStyle.bg} ${lvlStyle.text}`}>
                {profile.currentLevel}
              </span>
              <span className="text-white/50 text-sm">{XP_THRESHOLDS[profile.currentLevel]?.label}</span>
              <span className="ml-auto text-sun font-black text-lg">{profile.totalXp} XP</span>
            </div>
          </div>
        </div>

        {/* XP progress bar */}
        {next && threshold && (
          <div className="relative z-10 px-8 pb-6">
            <div className="flex justify-between text-xs text-white/30 font-bold mb-2">
              <span>{profile.currentLevel}</span>
              <span>{progress}% to {next}</span>
              <span>{next}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div className={`h-2 rounded-full transition-all duration-700 ${lvlStyle.bar}`} style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-white/25 mt-2">
              {Math.max(0, threshold.max - profile.totalXp)} XP to reach {next}
            </p>
            {progress >= 80 && (
              <div className="mt-4 rounded-2xl bg-sun/15 border border-sun/30 px-4 py-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sun animate-pulse shrink-0" />
                  <p className="text-sun font-black text-xs uppercase tracking-wide">
                    {progress >= 95 ? `Level test available — ${next}` : `Almost ready for ${next}`}
                  </p>
                </div>
                <p className="text-white/60 text-xs leading-relaxed">
                  {progress >= 95
                    ? `You've accumulated enough XP to attempt the ${next} level test. Pass it to officially advance your level.`
                    : `You're very close to unlocking the ${next} level test. Keep practicing — you're almost there!`}
                </p>
                {progress >= 95 && (
                  <button
                    type="button"
                    disabled
                    className="mt-1 w-full rounded-xl bg-sun/20 border border-sun/30 text-sun/50 font-bold text-xs py-2.5 cursor-not-allowed"
                  >
                    Take Level Test · Coming soon
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {profile.currentLevel === 'C2' && (
          <div className="relative z-10 px-8 pb-6">
            <div className="rounded-2xl bg-sun/15 border border-sun/30 px-4 py-3">
              <p className="text-sun font-black text-sm">Maximum level reached — congratulations!</p>
            </div>
          </div>
        )}
      </div>

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl bg-cream border-2 border-sun/30 p-5 text-center shadow-sm">
          <p className="text-3xl font-black text-navy">{totalRounds}</p>
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mt-1">Rounds</p>
        </div>
        <div className="rounded-2xl bg-white border-2 border-stone-200 p-5 text-center shadow-sm">
          <p className="text-3xl font-black text-navy">{avgScore}<span className="text-lg text-stone-400">%</span></p>
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mt-1">Average</p>
        </div>
        <div className="rounded-2xl bg-white border-2 border-steel/30 p-5 text-center shadow-sm">
          <p className="text-3xl font-black text-navy">+{totalXpEarned}</p>
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mt-1">XP earned</p>
        </div>
      </div>

      {/* ── HOW TO EARN XP ── */}
      <div className="rounded-3xl bg-white border-2 border-stone-200 p-6 shadow-sm mb-6">
        <p className="text-xs font-black text-stone-900 uppercase tracking-wide mb-4">How to earn XP</p>
        <div className="space-y-3">
          <div className="flex items-center gap-4 rounded-2xl bg-steel/8 border border-steel/20 px-4 py-3">
            <span className="rounded-full bg-navy text-white text-xs font-black px-3 py-1 shrink-0">+10 XP</span>
            <span className="text-sm text-stone-700">per correct answer in a quiz</span>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-stone-50 border border-stone-100 px-4 py-3">
            <span className="rounded-full bg-stone-200 text-stone-500 text-xs font-black px-3 py-1 shrink-0">0 XP</span>
            <span className="text-sm text-stone-400">for incorrect answers — keep practicing!</span>
          </div>
        </div>
      </div>

      {/* ── CEFR LEVEL SCALE ── */}
      <div className="rounded-3xl bg-white border-2 border-stone-200 p-6 shadow-sm mb-6">
        <p className="text-xs font-black text-stone-900 uppercase tracking-wide mb-4">CEFR level scale</p>
        <div className="space-y-2">
          {LEVELS.map(l => {
            const t = XP_THRESHOLDS[l];
            const isCurrentOrPast = LEVELS.indexOf(l) <= LEVELS.indexOf(profile.currentLevel);
            const isCurrent = l === profile.currentLevel;
            const ls = LEVEL_STYLE[l];
            return (
              <div key={l} className={`flex items-center gap-3 rounded-2xl px-4 py-3 border-2 transition-all ${
                isCurrent
                  ? `${ls.bg} ${ls.accent} shadow-sm`
                  : isCurrentOrPast
                  ? 'bg-stone-50 border-stone-200 opacity-60'
                  : 'bg-stone-50 border-stone-100 opacity-40'
              }`}>
                <span className={`text-sm font-black w-8 shrink-0 ${isCurrent ? ls.text : 'text-stone-500'}`}>{l}</span>
                <span className={`text-sm flex-1 ${isCurrent ? ls.text : 'text-stone-400'}`}>{t.label}</span>
                <span className={`text-xs font-bold shrink-0 ${isCurrent ? ls.text : 'text-stone-300'}`}>
                  {l === 'C2' ? `${t.min}+ XP` : `${t.min}–${t.max} XP`}
                </span>
                {isCurrent && <span className="rounded-full bg-white/30 text-current text-xs font-black px-2 py-0.5 shrink-0">← you</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── QUIZ HISTORY ── */}
      <div className="rounded-3xl bg-white border-2 border-stone-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <p className="text-xs font-black text-stone-900 uppercase tracking-wide">Quiz history</p>
          {history.length > 0 && (
            <span className="rounded-full bg-navy text-white text-xs font-black px-2.5 py-0.5">{history.length}</span>
          )}
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl bg-stone-50 border border-stone-100 p-6 text-center">
            <p className="text-sm text-stone-400">Complete a quiz to see your history here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((entry, idx) => {
              const pct = Math.round((entry.correct / entry.total) * 100);
              const expanded = expandedIdx === idx;
              const scoreColor = pct >= 80 ? 'bg-steel/20 text-navy' : pct >= 50 ? 'bg-sun/40 text-stone-800' : 'bg-coral/15 text-coral';
              const review = entry.review ?? [];
              const mistakes = review.filter(r => !r.wasCorrect).length;
              return (
                <div key={idx} className={`rounded-2xl border-2 overflow-hidden transition-all ${
                  expanded ? 'border-navy/30 shadow-sm' : 'border-stone-100'
                }`}>
                  {/* Row header — click to expand */}
                  <button
                    type="button"
                    onClick={() => setExpandedIdx(expanded ? null : idx)}
                    className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors ${
                      expanded ? 'bg-navy/4' : 'hover:bg-stone-50'
                    }`}
                  >
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-black shrink-0 ${scoreColor}`}>
                      {entry.correct}/{entry.total}
                    </span>
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wide shrink-0">{entry.level}</span>
                    <span className="text-xs text-stone-400 truncate flex-1">{entry.type}</span>
                    {mistakes > 0 && (
                      <span className="text-xs font-bold text-coral shrink-0">{mistakes} wrong</span>
                    )}
                    <span className="text-xs text-navy font-bold shrink-0">+{entry.xpEarned} XP</span>
                    <span className="text-xs text-stone-400 shrink-0">
                      {new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="text-xs font-bold text-stone-400 shrink-0 flex items-center gap-1">
                      {expanded ? 'Close' : 'Review'}
                      <span>{expanded ? '▲' : '▼'}</span>
                    </span>
                  </button>

                  {/* Expanded full review */}
                  {expanded && (
                    <div className="border-t border-stone-100 px-4 pt-4 pb-5 space-y-3">
                      {review.length === 0 ? (
                        <p className="text-sm text-stone-400 text-center py-4">
                          No review data available for this session.
                        </p>
                      ) : (
                        review.map((item, ri) => {
                          const hasOptions = Array.isArray(item.options) && item.options.length > 0;
                          return (
                            <div
                              key={ri}
                              className={`rounded-2xl border-2 p-4 ${
                                item.wasCorrect
                                  ? 'border-mint/40 bg-mint/8'
                                  : 'border-red-200 bg-red-50/60'
                              }`}
                            >
                              {/* Question header */}
                              <div className="flex items-center gap-2 mb-2.5">
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                                  item.wasCorrect ? 'bg-mint/30 text-navy' : 'bg-red-100 text-red-700'
                                }`}>
                                  {item.wasCorrect ? '✓ Correct' : '✗ Incorrect'}
                                </span>
                                <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">
                                  Q{ri + 1}
                                </span>
                              </div>

                              {/* Prompt */}
                              <p className="text-sm font-semibold text-stone-900 leading-snug mb-3">
                                {item.prompt}
                              </p>

                              {/* Full options list A/B/C/D */}
                              {hasOptions ? (
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
                                        className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-sm ${cls}`}
                                      >
                                        <span className="font-black text-xs w-4 shrink-0">
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
                              ) : (
                                /* Fallback for old entries without options array */
                                <div className="space-y-1 text-sm">
                                  <p className="text-stone-600">
                                    <span className="font-bold text-navy">Correct: </span>
                                    {item.options?.[item.correctIndex] ?? '—'}
                                  </p>
                                  {!item.wasCorrect && item.selectedIndex >= 0 && (
                                    <p className="text-stone-600">
                                      <span className="font-bold text-coral">Your answer: </span>
                                      {item.options?.[item.selectedIndex] ?? '—'}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
