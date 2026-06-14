import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../api/client';
import type { QuizStatsDto, UserProfile } from '../types/api';
import { useCountUp } from '../hooks/useCountUp';
import FadeIn from '../components/FadeIn';

interface AppEvent {
  id: number;
  title: string;
  category: string;
  location: string;
  online: boolean;
  eventDate: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  TALK: 'Talk', BOOK_CLUB: 'Book Club', FILM: 'Film', TRAVEL: 'Travel', OTHER: 'Event',
};

const LEVEL_THRESHOLDS: Record<string, [number, number, string]> = {
  A1: [0, 500, 'A2'], A2: [500, 1500, 'B1'], B1: [1500, 3000, 'B2'],
  B2: [3000, 5000, 'C1'], C1: [5000, 8000, 'C2'],
};

const HomePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<QuizStatsDto | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<AppEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await apiGet<UserProfile>('/api/users/me');
        if (!cancelled) setProfile(me);
      } catch { if (!cancelled) setProfile(null); }
      try {
        const q = await apiGet<QuizStatsDto>('/api/quizzes/stats', false);
        if (!cancelled) setStats(q);
      } catch { if (!cancelled) setStats(null); }
      try {
        const evs = await apiGet<AppEvent[]>('/api/events', false);
        const today = new Date().toDateString();
        const upcoming = evs.filter(e => e.eventDate && new Date(e.eventDate) >= new Date(today)).slice(0, 3);
        if (!cancelled) setUpcomingEvents(upcoming);
      } catch { if (!cancelled) setUpcomingEvents([]); }
    })();
    return () => { cancelled = true; };
  }, []);

  const name = profile?.username ?? 'there';
  const countQuestions = useCountUp(stats?.total ?? 0, 1400, !!stats);
  const countLevels = useCountUp(6, 1000, !!stats);
  const countEvents = useCountUp(8, 1200, !!stats);
  const xpData = profile && profile.currentLevel !== 'C2' ? LEVEL_THRESHOLDS[profile.currentLevel] : null;
  const xpPct = xpData && profile
    ? Math.min(100, Math.round(((profile.totalXp - xpData[0]) / (xpData[1] - xpData[0])) * 100))
    : 100;

  return (
    <div>
      {/* ── HERO ── */}
      <section className="bg-navy relative overflow-hidden">
        {/* Floating decorative circles */}
        <div className="float-1 absolute -top-20 -right-20 w-80 h-80 rounded-full bg-steel/10 pointer-events-none" />
        <div className="float-2 absolute bottom-10 -left-16 w-64 h-64 rounded-full bg-steel/8 pointer-events-none" />
        <div className="float-3 absolute top-1/2 left-1/2 w-36 h-36 rounded-full bg-sun/10 pointer-events-none" />
        <div className="h-1 w-full bg-steel" />
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 relative z-10">
          <p className="text-steel text-xs font-bold uppercase tracking-[0.2em] mb-8">
            English learning platform
          </p>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight">
            Real English,<br />
            <span className="text-steel">every day.</span>
          </h1>
          <p className="mt-6 text-white/55 text-base md:text-lg max-w-lg leading-relaxed">
            Welcome,{' '}
            <span className="text-white font-semibold">{name}</span>.{' '}
            Read, practice, and join real events.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/quizzes" className="rounded-full bg-white text-navy px-7 py-3.5 font-black text-sm shadow-md hover:shadow-xl hover:scale-[1.03] transition-all">
              Start quiz
            </Link>
            <Link to="/resources" className="rounded-full border border-white/30 text-white/80 px-7 py-3.5 font-semibold text-sm hover:border-steel hover:text-white transition-all">
              See materials
            </Link>
            <Link to="/events" className="rounded-full border border-white/30 text-white/80 px-7 py-3.5 font-semibold text-sm hover:border-steel hover:text-white transition-all">
              See events
            </Link>
          </div>

          {/* Stats — question count from DB */}
          {stats && (
            <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap gap-8 md:gap-14">
              {[
                { value: countQuestions, label: 'questions' },
                { value: countLevels, label: 'CEFR levels' },
                { value: countEvents, label: 'events' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-4xl font-black text-sun tabular-nums">{value}</p>
                  <p className="text-[11px] text-white/35 font-bold uppercase tracking-widest mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── XP BAR ── */}

      {profile && (
        <section className="max-w-5xl mx-auto px-6 pt-8 pb-2">
          <div className="rounded-3xl bg-white border border-stone-200 px-8 py-6 shadow-sm flex flex-col md:flex-row md:items-center gap-5">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-black text-stone-800">
                  Level <span className="text-navy">{profile.currentLevel}</span>
                </span>
                <span className="text-sm font-bold text-stone-500">{profile.totalXp} XP</span>
              </div>
              {xpData ? (
                <>
                  <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-2.5 rounded-full bg-steel transition-all" style={{ width: `${xpPct}%` }} />
                  </div>
                  <p className="text-xs text-stone-400 mt-1.5">{Math.max(0, xpData[1] - profile.totalXp)} XP to reach {xpData[2]}</p>
                  {xpPct >= 95 && (
                    <div className="mt-3 rounded-2xl bg-sun/20 border border-sun/40 px-4 py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-sun animate-pulse inline-block" />
                          Level test available — {xpData[2]}
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5">Pass the test to advance to {xpData[2]}.</p>
                      </div>
                      <button
                        type="button"
                        disabled
                        className="shrink-0 rounded-full bg-stone-200 text-stone-400 font-bold text-xs px-4 py-2 cursor-not-allowed"
                      >
                        Coming soon
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs font-bold text-navy mt-1">Maximum level — congratulations!</p>
              )}
            </div>
            <Link to="/profile" className="shrink-0 rounded-full border-2 border-navy/20 text-navy px-5 py-2 text-sm font-bold hover:bg-navy hover:text-white hover:border-navy transition-colors">
              View profile
            </Link>
          </div>
        </section>
      )}

      {/* ── MAIN CARDS ── */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-black text-stone-900 mb-8">What do you want to do today?</h2>

        <div className="space-y-4">
          {/* Quiz — navy featured */}
          <FadeIn delay={0}>
          <Link
            to="/quizzes"
            className="block rounded-3xl bg-navy p-8 md:p-10 shadow-md hover:shadow-xl transition-all hover:scale-[1.005] group"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase text-steel/70 tracking-wider">Quizzes</span>
                <h3 className="text-2xl font-black text-white mt-2">
                  {stats ? `${stats.total}+ questions by level and type` : '200+ questions by level and type'}
                </h3>
                <p className="text-white/60 mt-3 leading-relaxed text-sm max-w-lg">
                  Grammar, vocabulary, reading and idioms — mixed so every round is different.
                </p>
              </div>
              <span className="self-start md:self-center shrink-0 rounded-full bg-white text-navy px-6 py-3 text-sm font-bold shadow">
                Practice now
              </span>
            </div>
          </Link>
          </FadeIn>

          {/* Two-column: Events + Blog */}
          <FadeIn delay={100}>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              to="/events"
              className="block rounded-3xl bg-teal border-2 border-teal p-8 shadow-sm hover:shadow-md hover:border-steel/60 transition-all group"
            >
              <span className="text-xs font-bold uppercase text-navy/50 tracking-wider">Events</span>
              <h3 className="text-xl font-black text-stone-900 mt-2 group-hover:text-navy transition-colors">
                Activities in Spain
              </h3>
              <p className="text-stone-600 mt-3 leading-relaxed text-sm">
                Talks, book clubs and meetups to practice English in person.
              </p>
              <span className="inline-block mt-5 rounded-full bg-navy text-white px-5 py-2 text-sm font-bold hover:bg-navy/85 transition-colors">
                See events
              </span>
            </Link>

            <Link
              to="/blog"
              className="block rounded-3xl bg-peach/40 border-2 border-peach/60 p-8 shadow-sm hover:shadow-md hover:border-apricot/60 transition-all group"
            >
              <span className="text-xs font-bold uppercase text-apricot/70 tracking-wider">Blog</span>
              <h3 className="text-xl font-black text-stone-900 mt-2 group-hover:text-navy transition-colors">
                Tips and posts
              </h3>
              <p className="text-stone-600 mt-3 leading-relaxed text-sm">
                Posts about culture and learning. Read, reflect and leave a comment.
              </p>
              <span className="inline-block mt-5 rounded-full bg-navy text-white px-5 py-2 text-sm font-bold hover:bg-navy/85 transition-colors">
                Read and comment
              </span>
            </Link>
          </div>
          </FadeIn>

          {/* Materials */}
          <FadeIn delay={200}>
          <Link
            to="/resources"
            className="block rounded-3xl bg-sage border-2 border-sage p-8 shadow-sm hover:shadow-md hover:border-mint/60 transition-all group"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase text-navy/50 tracking-wider">Materials</span>
                <h3 className="text-xl font-black text-stone-900 mt-2 group-hover:text-navy transition-colors">
                  Grammar, vocabulary and dictionary
                </h3>
                <p className="text-stone-600 mt-3 leading-relaxed text-sm">
                  Curated resources — Perfect English Grammar, Cambridge Dictionary, IELTS vocabulary and more.
                </p>
              </div>
              <span className="self-start md:self-center shrink-0 rounded-full bg-navy text-white px-6 py-3 text-sm font-bold shadow group-hover:bg-navy/85 transition-colors">
                Open library
              </span>
            </div>
          </Link>
          </FadeIn>
        </div>

        {/* Upcoming events strip */}
        {upcomingEvents.length > 0 && (
          <div className="mt-4 rounded-3xl bg-cream border-2 border-sun/30 p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-stone-900">Upcoming events</h3>
              <Link to="/events" className="text-sm font-bold text-navy hover:underline">See all</Link>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map(ev => (
                <div key={ev.id} className="flex items-center gap-4 rounded-2xl bg-white border border-stone-200 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-stone-900 truncate">{ev.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {ev.eventDate ? new Date(ev.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : ''}
                      {' · '}{ev.online ? 'Online' : ev.location}
                    </p>
                  </div>
                  <span className="ml-auto shrink-0 text-xs font-bold rounded-full bg-steel/25 text-navy px-3 py-1.5">
                    {CATEGORY_LABELS[ev.category] ?? 'Event'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
