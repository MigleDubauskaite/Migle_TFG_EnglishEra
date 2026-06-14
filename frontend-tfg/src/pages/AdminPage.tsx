import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiDelete, apiPatch } from '../api/client';

// ── Types ────────────────────────────────────────────────────────────────────

interface AdminStats { totalUsers: number; totalQuizzes: number; totalPosts: number; totalEvents: number; }
interface AdminUser { id: number; username: string; email: string; role: string; currentLevel: string; totalXp: number; }
interface AdminComment { id: number; postId: number; postTitle: string; authorUsername: string; body: string; createdAt: string; }
interface AdminQuiz { id: number; level: string; questionType: string; prompt: string; optA: string; optB: string; optC: string; optD: string; correctIndex: number; }

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const QTYPES = ['GRAMMAR', 'VOCABULARY', 'IDIOM', 'PHRASAL'];

const LEVEL_COLOR: Record<string, string> = {
  A1: 'bg-steel/20 text-navy', A2: 'bg-steel/40 text-navy',
  B1: 'bg-apricot/30 text-stone-800', B2: 'bg-apricot/60 text-stone-800',
  C1: 'bg-navy/80 text-white', C2: 'bg-navy text-white',
};

// ── Small reusable components ────────────────────────────────────────────────

function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-coral/70 hover:text-coral text-xs font-bold px-2 py-1 rounded-lg hover:bg-coral/10 transition-colors"
    >
      Delete
    </button>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-stone-900">{title}</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-xl font-bold">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full rounded-xl border-2 border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 outline-none focus:border-navy focus:bg-white transition-colors';
const selectCls = `${inputCls} cursor-pointer`;

// ── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'users' | 'comments' | 'questions';

// ── Main component ────────────────────────────────────────────────────────────

const AdminPage = () => {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>([]);
  const [quizLevel, setQuizLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modals
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddQuiz, setShowAddQuiz] = useState(false);

  // Edit user
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', password: '', role: 'USER', currentLevel: 'A1' });
  const [editLoading, setEditLoading] = useState(false);
  const [editErr, setEditErr] = useState('');

  // Add user form
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'USER', currentLevel: 'A1' });
  const [userErr, setUserErr] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  // Add quiz form
  const [newQuiz, setNewQuiz] = useState({ level: 'A1', questionType: 'GRAMMAR', prompt: '', optA: '', optB: '', optC: '', optD: '', correctIndex: 0 });
  const [quizErr, setQuizErr] = useState('');
  const [quizLoading, setQuizLoading] = useState(false);

  // Edit quiz
  const [editQuiz, setEditQuiz] = useState<AdminQuiz | null>(null);
  const [editQuizForm, setEditQuizForm] = useState({ level: 'A1', questionType: 'GRAMMAR', prompt: '', optA: '', optB: '', optC: '', optD: '', correctIndex: 0 });
  const [editQuizErr, setEditQuizErr] = useState('');
  const [editQuizLoading, setEditQuizLoading] = useState(false);

  // Initial load
  useEffect(() => {
    Promise.all([
      apiGet<AdminStats>('/api/admin/stats'),
      apiGet<AdminUser[]>('/api/admin/users'),
      apiGet<AdminComment[]>('/api/admin/comments'),
    ])
      .then(([s, u, c]) => { setStats(s); setUsers(u); setComments(c); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  // Load quizzes when switching to that tab or changing filter
  useEffect(() => {
    if (tab !== 'questions') return;
    const url = quizLevel ? `/api/admin/quizzes?level=${quizLevel}` : '/api/admin/quizzes';
    apiGet<AdminQuiz[]>(url).then(setQuizzes).catch(() => {});
  }, [tab, quizLevel]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const openEditUser = (u: AdminUser) => {
    setEditUser(u);
    setEditForm({ username: u.username, email: u.email, password: '', role: u.role, currentLevel: u.currentLevel });
    setEditErr('');
  };

  const submitEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditLoading(true); setEditErr('');
    try {
      const payload = { ...editForm, password: editForm.password || undefined };
      const updated = await apiPatch<AdminUser>(`/api/admin/users/${editUser.id}`, payload);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      setEditUser(null);
    } catch (e: any) { setEditErr(e.message); }
    finally { setEditLoading(false); }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    try {
      await apiDelete('/api/admin/users/' + id);
      setUsers(u => u.filter(x => x.id !== id));
      setStats(s => s ? { ...s, totalUsers: s.totalUsers - 1 } : s);
    } catch (e: any) { alert(e.message); }
  };

  const deleteComment = async (id: number) => {
    if (!confirm('Delete this comment?')) return;
    await apiDelete('/api/admin/comments/' + id);
    setComments(c => c.filter(x => x.id !== id));
  };

  const deleteQuiz = async (id: number) => {
    if (!confirm('Delete this question?')) return;
    await apiDelete('/api/admin/quizzes/' + id);
    setQuizzes(q => q.filter(x => x.id !== id));
    setStats(s => s ? { ...s, totalQuizzes: s.totalQuizzes - 1 } : s);
  };

  const openEditQuiz = (q: AdminQuiz) => {
    setEditQuiz(q);
    setEditQuizForm({ level: q.level, questionType: q.questionType, prompt: q.prompt, optA: q.optA, optB: q.optB, optC: q.optC, optD: q.optD, correctIndex: q.correctIndex });
    setEditQuizErr('');
  };

  const submitEditQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editQuiz) return;
    setEditQuizErr(''); setEditQuizLoading(true);
    try {
      const updated = await apiPatch<AdminQuiz>(`/api/admin/quizzes/${editQuiz.id}`, editQuizForm);
      setQuizzes(prev => prev.map(q => q.id === updated.id ? updated : q));
      setEditQuiz(null);
    } catch (e: any) { setEditQuizErr(e.message); }
    finally { setEditQuizLoading(false); }
  };

  const submitAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserErr(''); setUserLoading(true);
    try {
      const created = await apiPost<AdminUser>('/api/admin/users', newUser);
      setUsers(u => [...u, created]);
      setStats(s => s ? { ...s, totalUsers: s.totalUsers + 1 } : s);
      setShowAddUser(false);
      setNewUser({ username: '', email: '', password: '', role: 'USER', currentLevel: 'A1' });
    } catch (e: any) { setUserErr(e.message); }
    finally { setUserLoading(false); }
  };

  const submitAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuizErr(''); setQuizLoading(true);
    try {
      const created = await apiPost<AdminQuiz>('/api/admin/quizzes', newQuiz);
      setQuizzes(q => [created, ...q]);
      setStats(s => s ? { ...s, totalQuizzes: s.totalQuizzes + 1 } : s);
      setShowAddQuiz(false);
      setNewQuiz({ level: 'A1', questionType: 'GRAMMAR', prompt: '', optA: '', optB: '', optC: '', optD: '', correctIndex: 0 });
    } catch (e: any) { setQuizErr(e.message); }
    finally { setQuizLoading(false); }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-8 h-8 border-4 border-navy border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto px-5 py-16 text-center">
      <p className="text-coral font-semibold">Could not load admin data.</p>
    </div>
  );

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview',  label: 'Overview' },
    { key: 'users',     label: 'Users',     count: users.length },
    { key: 'comments',  label: 'Comments',  count: comments.length },
    { key: 'questions', label: 'Questions', count: stats?.totalQuizzes },
  ];

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="text-3xl font-black text-stone-900 mb-6">Admin Panel</h1>

      {/* Tab bar */}
      <div className="flex gap-1 mb-8 border-b border-stone-200">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 text-sm font-bold rounded-t-xl transition-colors ${
              tab === t.key
                ? 'bg-navy text-white'
                : 'text-stone-500 hover:text-navy hover:bg-stone-100'
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${tab === t.key ? 'bg-white/20' : 'bg-stone-200'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'overview' && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Users', value: stats.totalUsers },
            { label: 'Quizzes', value: stats.totalQuizzes },
            { label: 'Posts', value: stats.totalPosts },
            { label: 'Events', value: stats.totalEvents },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-stone-200 p-6 text-center shadow-sm">
              <p className="text-4xl font-black text-navy">{value}</p>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Users ── */}
      {tab === 'users' && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowAddUser(true)}
              className="bg-navy text-white text-sm font-bold px-5 py-2 rounded-xl hover:bg-navy/85 transition-colors"
            >
              + Add user
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-xs font-bold text-stone-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">User</th>
                    <th className="px-5 py-3 text-left">Email</th>
                    <th className="px-5 py-3 text-left">Level</th>
                    <th className="px-5 py-3 text-left">XP</th>
                    <th className="px-5 py-3 text-left">Role</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center shrink-0">
                            <span className="text-xs font-black text-white">{u.username.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="font-semibold text-stone-900">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-stone-500">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${LEVEL_COLOR[u.currentLevel] ?? 'bg-stone-100 text-stone-600'}`}>
                          {u.currentLevel}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-stone-600 font-semibold">{u.totalXp}</td>
                      <td className="px-5 py-3">
                        {u.role === 'ADMIN'
                          ? <span className="bg-sun text-stone-900 rounded-full px-2.5 py-0.5 text-xs font-black">ADMIN</span>
                          : <span className="text-stone-400 text-xs">user</span>}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditUser(u)}
                            className="text-navy/60 hover:text-navy text-xs font-bold px-2 py-1 rounded-lg hover:bg-navy/8 transition-colors"
                          >
                            Edit
                          </button>
                          {u.role !== 'ADMIN' && <DeleteBtn onClick={() => deleteUser(u.id)} />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Comments ── */}
      {tab === 'comments' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {comments.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-12">No comments yet.</p>
          ) : (
            <div className="divide-y divide-stone-100">
              {comments.map(c => (
                <div key={c.id} className="px-5 py-4 hover:bg-stone-50 transition-colors flex gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-black text-navy">{c.authorUsername}</span>
                      <span className="text-xs text-stone-400">on</span>
                      <span className="text-xs font-semibold text-stone-600 truncate max-w-[200px]">"{c.postTitle}"</span>
                      <span className="text-xs text-stone-300">{new Date(c.createdAt).toLocaleDateString('en-GB')}</span>
                    </div>
                    <p className="text-sm text-stone-700 leading-relaxed">{c.body}</p>
                  </div>
                  <div className="shrink-0 self-start pt-1">
                    <DeleteBtn onClick={() => deleteComment(c.id)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Questions ── */}
      {tab === 'questions' && (
        <>
          <div className="flex items-center gap-3 mb-4 justify-between flex-wrap">
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setQuizLevel('')}
                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${!quizLevel ? 'bg-navy text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
              >All</button>
              {LEVELS.map(l => (
                <button
                  key={l}
                  onClick={() => setQuizLevel(l)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${quizLevel === l ? 'bg-navy text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                >{l}</button>
              ))}
            </div>
            <button
              onClick={() => setShowAddQuiz(true)}
              className="bg-navy text-white text-sm font-bold px-5 py-2 rounded-xl hover:bg-navy/85 transition-colors"
            >
              + Add question
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            {quizzes.length === 0 ? (
              <p className="text-stone-400 text-sm text-center py-12">No questions found.</p>
            ) : (
              <div className="divide-y divide-stone-100">
                {quizzes.map(q => (
                  <div key={q.id} className="px-5 py-4 hover:bg-stone-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex gap-1.5 shrink-0 pt-0.5">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-black ${LEVEL_COLOR[q.level] ?? 'bg-stone-100'}`}>{q.level}</span>
                        <span className="rounded-full px-2 py-0.5 text-xs font-bold bg-stone-100 text-stone-500">{q.questionType}</span>
                      </div>
                      <p className="flex-1 text-sm text-stone-800 font-medium leading-snug">{q.prompt}</p>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => openEditQuiz(q)}
                          className="text-navy/60 hover:text-navy text-xs font-bold px-2 py-1 rounded-lg hover:bg-navy/10 transition-colors"
                        >Edit</button>
                        <DeleteBtn onClick={() => deleteQuiz(q.id)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mt-3 pl-1">
                      {[q.optA, q.optB, q.optC, q.optD].map((opt, i) => (
                        <div
                          key={i}
                          className={`text-xs px-3 py-1.5 rounded-lg border ${i === q.correctIndex ? 'border-green-300 bg-green-50 font-bold text-green-800' : 'border-stone-100 text-stone-500'}`}
                        >
                          <span className="font-black mr-1">{String.fromCharCode(65 + i)}.</span>{opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Modal: Add user ── */}
      {showAddUser && (
        <Modal title="Add user" onClose={() => { setShowAddUser(false); setUserErr(''); }}>
          <form onSubmit={submitAddUser} className="space-y-4">
            {userErr && <p className="text-coral text-sm font-semibold">{userErr}</p>}
            <Field label="Username">
              <input className={inputCls} required value={newUser.username} onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))} />
            </Field>
            <Field label="Email">
              <input type="email" className={inputCls} required value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} />
            </Field>
            <Field label="Password">
              <input type="password" className={inputCls} required minLength={6} value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Level">
                <select className={selectCls} value={newUser.currentLevel} onChange={e => setNewUser(p => ({ ...p, currentLevel: e.target.value }))}>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Role">
                <select className={selectCls} value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
                  <option>USER</option>
                  <option>ADMIN</option>
                </select>
              </Field>
            </div>
            <button
              type="submit"
              disabled={userLoading}
              className="w-full bg-navy text-white font-bold py-2.5 rounded-xl hover:bg-navy/85 disabled:opacity-50 transition-colors mt-1"
            >
              {userLoading ? 'Creating…' : 'Create user'}
            </button>
          </form>
        </Modal>
      )}

      {/* ── Modal: Edit user ── */}
      {editUser && (
        <Modal title={`Edit user — ${editUser.username}`} onClose={() => setEditUser(null)}>
          <form onSubmit={submitEditUser} className="space-y-4">
            {editErr && <p className="text-coral text-sm font-semibold">{editErr}</p>}
            <Field label="Username">
              <input className={inputCls} required value={editForm.username}
                onChange={e => setEditForm(p => ({ ...p, username: e.target.value }))} />
            </Field>
            <Field label="Email">
              <input type="email" className={inputCls} required value={editForm.email}
                onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
            </Field>
            <Field label="New password (leave blank to keep current)">
              <input type="password" className={inputCls} placeholder="••••••" minLength={6}
                value={editForm.password}
                onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Level">
                <select className={selectCls} value={editForm.currentLevel}
                  onChange={e => setEditForm(p => ({ ...p, currentLevel: e.target.value }))}>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Role">
                <select className={selectCls} value={editForm.role}
                  onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
                  <option>USER</option>
                  <option>ADMIN</option>
                </select>
              </Field>
            </div>
            <button
              type="submit"
              disabled={editLoading}
              className="w-full bg-navy text-white font-bold py-2.5 rounded-xl hover:bg-navy/85 disabled:opacity-50 transition-colors mt-1"
            >
              {editLoading ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </Modal>
      )}

      {/* ── Modal: Edit question ── */}
      {editQuiz && (
        <Modal title="Edit question" onClose={() => { setEditQuiz(null); setEditQuizErr(''); }}>
          <form onSubmit={submitEditQuiz} className="space-y-3">
            {editQuizErr && <p className="text-coral text-sm font-semibold">{editQuizErr}</p>}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Level">
                <select className={selectCls} value={editQuizForm.level} onChange={e => setEditQuizForm(p => ({ ...p, level: e.target.value }))}>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Type">
                <select className={selectCls} value={editQuizForm.questionType} onChange={e => setEditQuizForm(p => ({ ...p, questionType: e.target.value }))}>
                  {QTYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Question">
              <textarea className={`${inputCls} resize-none`} rows={2} required value={editQuizForm.prompt} onChange={e => setEditQuizForm(p => ({ ...p, prompt: e.target.value }))} />
            </Field>
            {(['A', 'B', 'C', 'D'] as const).map((letter, i) => {
              const key = `opt${letter}` as 'optA' | 'optB' | 'optC' | 'optD';
              return (
                <Field key={letter} label={`Option ${letter}${editQuizForm.correctIndex === i ? ' ✓ correct' : ''}`}>
                  <div className="flex gap-2">
                    <input className={`${inputCls} flex-1`} required value={editQuizForm[key]} onChange={e => setEditQuizForm(p => ({ ...p, [key]: e.target.value }))} />
                    <button
                      type="button"
                      onClick={() => setEditQuizForm(p => ({ ...p, correctIndex: i }))}
                      className={`px-3 rounded-xl text-xs font-bold border-2 transition-colors ${editQuizForm.correctIndex === i ? 'border-green-400 bg-green-50 text-green-700' : 'border-stone-200 text-stone-400 hover:border-stone-300'}`}
                    >✓</button>
                  </div>
                </Field>
              );
            })}
            <button
              type="submit"
              disabled={editQuizLoading}
              className="w-full bg-navy text-white font-bold py-2.5 rounded-xl hover:bg-navy/85 disabled:opacity-50 transition-colors"
            >
              {editQuizLoading ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </Modal>
      )}

      {/* ── Modal: Add question ── */}
      {showAddQuiz && (
        <Modal title="Add question" onClose={() => { setShowAddQuiz(false); setQuizErr(''); }}>
          <form onSubmit={submitAddQuiz} className="space-y-3">
            {quizErr && <p className="text-coral text-sm font-semibold">{quizErr}</p>}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Level">
                <select className={selectCls} value={newQuiz.level} onChange={e => setNewQuiz(p => ({ ...p, level: e.target.value }))}>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Type">
                <select className={selectCls} value={newQuiz.questionType} onChange={e => setNewQuiz(p => ({ ...p, questionType: e.target.value }))}>
                  {QTYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Question">
              <textarea className={`${inputCls} resize-none`} rows={2} required value={newQuiz.prompt} onChange={e => setNewQuiz(p => ({ ...p, prompt: e.target.value }))} />
            </Field>
            {(['A', 'B', 'C', 'D'] as const).map((letter, i) => {
              const key = `opt${letter}` as 'optA' | 'optB' | 'optC' | 'optD';
              return (
                <Field key={letter} label={`Option ${letter}${newQuiz.correctIndex === i ? ' ✓ correct' : ''}`}>
                  <div className="flex gap-2">
                    <input className={`${inputCls} flex-1`} required value={newQuiz[key]} onChange={e => setNewQuiz(p => ({ ...p, [key]: e.target.value }))} />
                    <button
                      type="button"
                      onClick={() => setNewQuiz(p => ({ ...p, correctIndex: i }))}
                      className={`px-3 rounded-xl text-xs font-bold border-2 transition-colors ${newQuiz.correctIndex === i ? 'border-green-400 bg-green-50 text-green-700' : 'border-stone-200 text-stone-400 hover:border-stone-300'}`}
                    >✓</button>
                  </div>
                </Field>
              );
            })}
            <button
              type="submit"
              disabled={quizLoading}
              className="w-full bg-navy text-white font-bold py-2.5 rounded-xl hover:bg-navy/85 disabled:opacity-50 transition-colors"
            >
              {quizLoading ? 'Creating…' : 'Create question'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminPage;
