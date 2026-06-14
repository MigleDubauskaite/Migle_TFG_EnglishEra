import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiGet, apiPost, setSession } from '../api/client';
import type { LoginResponse, QuizStatsDto } from '../types/api';

interface RegisterProps {
  onRegistered: () => void;
}

const LEVEL_OPTIONS = [
  { value: 'A1', label: 'A1 — Beginner' },
  { value: 'A2', label: 'A2 — Elementary' },
  { value: 'B1', label: 'B1 — Intermediate' },
  { value: 'B2', label: 'B2 — Upper-Intermediate' },
  { value: 'C1', label: 'C1 — Advanced' },
  { value: 'C2', label: 'C2 — Mastery' },
];

const Register = ({ onRegistered }: RegisterProps) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState('A1');
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
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const data = await apiPost<LoginResponse>(
        '/api/auth/register',
        { username: username.trim(), email: email.trim(), password, level },
        false
      );
      setSession(
        data.token,
        JSON.stringify({ id: data.id, username: data.username, email: data.email, currentLevel: data.currentLevel, totalXp: data.totalXP, role: data.role }),
        false
      );
      localStorage.removeItem('quizHistory');
      onRegistered();
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg || 'Could not create account. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-2xl border-2 border-stone-200 bg-stone-50 px-4 py-3.5 text-stone-900 placeholder-stone-300 outline-none focus:border-navy focus:bg-white transition-colors text-sm";

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-5/12 bg-navy flex-col justify-center p-14 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-apricot/10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-sun/8" />

        <div className="relative z-10 space-y-6">
          <span className="text-xs font-bold tracking-[0.25em] text-steel/60 uppercase">English Era</span>
          <h1 className="text-4xl font-black text-white leading-tight">
            Start your<br />
            <span className="text-sun">English journey</span><br />
            today.
          </h1>
          <p className="text-white/45 text-sm leading-relaxed max-w-xs">
            Register for free and start earning XP, leveling up and practicing with hundreds of questions.
          </p>

          {/* Feature list */}
          <div className="space-y-3 pt-2">
            {[
              { icon: '✓', text: `${questionCount !== null ? questionCount + '+' : 'Hundreds of'} grammar, vocabulary and idioms questions` },
              { icon: '✓', text: 'XP system and CEFR levels A1–C2' },
              { icon: '✓', text: 'Events in Spain to practice in person' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <span className="rounded-full bg-steel/20 text-steel w-5 h-5 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">{icon}</span>
                <span className="text-white/55 text-sm leading-snug">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-stone-50 overflow-y-auto">
        <div className="w-full max-w-md">
          <p className="lg:hidden text-center text-navy font-black text-2xl mb-8 tracking-tight">English Era</p>

          <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-stone-900">Create your account</h2>
              <p className="text-stone-400 text-sm mt-1.5">It's free and only takes a minute.</p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl bg-coral/8 border border-coral/20 px-4 py-3">
                <p className="text-coral text-sm font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Username</label>
                <input type="text" className={inputClass} value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. ana_smith" required minLength={2} />
                <p className="text-xs text-stone-400 mt-1.5 ml-1">It will appear in greetings and your comments.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Email</label>
                <input type="email" className={inputClass} value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" required />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Password</label>
                <input type="password" className={inputClass} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="At least 6 characters" required minLength={6} />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Your English level</label>
                <select value={level} onChange={e => setLevel(e.target.value)} className={inputClass}>
                  {LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <p className="text-xs text-stone-400 mt-1.5 ml-1">Your level advances automatically as you earn XP through quizzes.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-navy text-white font-black py-4 shadow-md hover:bg-navy/85 disabled:opacity-50 transition-all hover:shadow-lg mt-2 text-sm"
              >
                {loading ? 'Creating account…' : 'Create free account'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-stone-100" />
              <span className="text-xs text-stone-300 font-semibold">or</span>
              <div className="flex-1 h-px bg-stone-100" />
            </div>

            <p className="text-stone-500 text-sm text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-navy font-bold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
