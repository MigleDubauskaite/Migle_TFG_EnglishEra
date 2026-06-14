import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, apiPost, setSession } from '../api/client';
import type { LoginResponse, QuizStatsDto } from '../types/api';

interface LoginProps {
  onLoginSuccess: () => void;
}

const LEVELS = [
  { key: 'A1', label: 'Beginner' },
  { key: 'A2', label: 'Elementary' },
  { key: 'B1', label: 'Intermediate' },
  { key: 'B2', label: 'Upper-Int.' },
  { key: 'C1', label: 'Advanced' },
  { key: 'C2', label: 'Mastery' },
];

const Login = ({ onLoginSuccess }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState<number | null>(null);

  useEffect(() => {
    apiGet<QuizStatsDto>('/api/quizzes/stats', false)
      .then(s => setQuestionCount(s.total))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiPost<LoginResponse>(
        '/api/auth/login',
        { email: email.trim(), password, rememberMe },
        false
      );
      setSession(
        data.token,
        JSON.stringify({ id: data.id, username: data.username, email: data.email, currentLevel: data.currentLevel, totalXp: data.totalXP, role: data.role }),
        rememberMe
      );
      onLoginSuccess();
    } catch {
      setError('Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL — decorative ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy flex-col justify-between p-14 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-steel/10" />
        <div className="absolute bottom-12 -left-20 w-72 h-72 rounded-full bg-steel/8" />
        <div className="absolute top-1/3 left-1/2 w-40 h-40 rounded-full bg-sun/10" />

        {/* Brand */}
        <div className="relative z-10">
          <span className="text-xs font-bold tracking-[0.25em] text-steel/70 uppercase">English Era</span>
        </div>

        {/* Main message */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
            Real English,<br />
            <span className="text-steel">every day.</span>
          </h1>
          <p className="text-white/50 text-base leading-relaxed max-w-sm">
            Practice grammar, vocabulary and idioms. Earn XP and level up from A1 to C2.
          </p>

          {/* Level badges decoration */}
          <div className="flex flex-wrap gap-2 pt-2">
            {LEVELS.map(l => (
              <div key={l.key} className="rounded-full border border-white/15 px-4 py-1.5">
                <span className="text-xs font-black text-white/70">{l.key}</span>
                <span className="text-xs text-white/35 ml-1.5">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats — question count from DB */}
        <div className="relative z-10 flex gap-10 border-t border-white/10 pt-8">
          {[
            { n: questionCount !== null ? String(questionCount) : '—', l: 'questions' },
            { n: '6', l: 'CEFR levels' },
            { n: '4', l: 'quiz types' },
          ].map(({ n, l }) => (
            <div key={l}>
              <p className="text-3xl font-black text-sun">{n}</p>
              <p className="text-xs text-white/35 font-bold uppercase tracking-widest mt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-stone-50">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <p className="lg:hidden text-center text-navy font-black text-2xl mb-8 tracking-tight">English Era</p>

          <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-stone-900">Welcome back</h2>
              <p className="text-stone-400 text-sm mt-1.5">Sign in to continue your progress.</p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl bg-coral/8 border border-coral/20 px-4 py-3">
                <p className="text-coral text-sm font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full rounded-2xl border-2 border-stone-200 bg-stone-50 px-4 py-3.5 text-stone-900 placeholder-stone-300 outline-none focus:border-navy focus:bg-white transition-colors text-sm"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full rounded-2xl border-2 border-stone-200 bg-stone-50 px-4 py-3.5 text-stone-900 placeholder-stone-300 outline-none focus:border-navy focus:bg-white transition-colors text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-navy cursor-pointer"
                />
                <span className="text-sm text-stone-500">Remember me</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-navy text-white font-black py-4 shadow-md hover:bg-navy/85 disabled:opacity-50 transition-all hover:shadow-lg mt-2 text-sm"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-stone-100" />
              <span className="text-xs text-stone-300 font-semibold">or</span>
              <div className="flex-1 h-px bg-stone-100" />
            </div>

            <p className="text-stone-500 text-sm text-center">
              Don't have an account?{' '}
              <Link to="/register" className="text-navy font-bold hover:underline">
                Register for free
              </Link>
            </p>

            <p className="text-stone-300 text-xs text-center mt-4">
              Demo: admin@gmail.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
