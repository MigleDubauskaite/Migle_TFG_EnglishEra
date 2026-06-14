import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/client';
import type { PostDetail, PostSummary } from '../types/api';

const BlogPage = () => {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<PostDetail | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadList = async () => {
    try {
      const data = await apiGet<PostSummary[]>('/api/posts', false);
      setPosts(data);
    } catch {
      setError('Could not load posts.');
    }
  };

  useEffect(() => { loadList(); }, []);

  useEffect(() => {
    if (selectedId == null) { setDetail(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const d = await apiGet<PostDetail>(`/api/posts/${selectedId}`, false);
        if (!cancelled) setDetail(d);
      } catch {
        if (!cancelled) setError('Could not open post.');
      }
    })();
    return () => { cancelled = true; };
  }, [selectedId]);

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await apiPost('/api/posts', { title: title.trim(), body: body.trim() });
      setTitle('');
      setBody('');
      await loadList();
    } catch {
      setError('Could not publish post. Sign in and try again.');
    }
  };

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedId == null) return;
    setError(null);
    try {
      await apiPost(`/api/posts/${selectedId}/comments`, { body: commentBody.trim() });
      setCommentBody('');
      const d = await apiGet<PostDetail>(`/api/posts/${selectedId}`, false);
      setDetail(d);
    } catch {
      setError('Could not add comment.');
    }
  };

  const inputClass = "w-full rounded-2xl border-2 border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none focus:border-navy focus:bg-white transition-colors";

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-black text-stone-900">Blog</h1>

      {error && <p className="mt-4 text-coral font-semibold text-sm">{error}</p>}

      {/* New post form */}
      <section className="mt-10 rounded-3xl bg-sage border-2 border-sage p-6 md:p-8 shadow-sm">
        <h2 className="text-sm font-black text-stone-900 uppercase tracking-wide mb-4">New post</h2>
        <form onSubmit={createPost} className="space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            required
          />
          <textarea
            placeholder="Write something helpful for other learners…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className={inputClass}
            required
          />
          <button
            type="submit"
            className="rounded-full bg-navy text-white font-bold px-6 py-3 text-sm shadow-sm hover:bg-navy/85 transition-colors"
          >
            Publish
          </button>
        </form>
      </section>

      {/* Featured post */}
      {posts.length > 0 && (() => {
        const featured = posts[0];
        return (
          <section className="mt-10">
            <p className="text-xs font-bold uppercase tracking-widest text-navy/50 mb-3">Featured</p>
            <button
              type="button"
              onClick={() => setSelectedId(featured.id)}
              className={`w-full text-left rounded-3xl border-2 p-6 md:p-8 shadow-sm transition-all ${
                selectedId === featured.id
                  ? 'border-navy bg-navy/5'
                  : 'border-stone-200 bg-white hover:border-steel hover:shadow-md'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-navy uppercase tracking-wide mb-2">{featured.authorUsername}</p>
                  <h3 className="text-xl md:text-2xl font-black text-stone-900">{featured.title}</h3>
                  <p className="text-xs text-stone-400 mt-2">{new Date(featured.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <span className="shrink-0 self-start md:self-center rounded-full border-2 border-navy/20 text-navy px-5 py-2 text-sm font-bold whitespace-nowrap">
                  Read post
                </span>
              </div>
            </button>
          </section>
        );
      })()}

      {/* Posts list + detail */}
      <div className="mt-12 grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-stone-900 uppercase tracking-wide">All posts</h2>
            <span className="text-xs text-stone-400">{posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase())).length} posts</span>
          </div>
          <input
            type="search"
            placeholder="Search posts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mb-3 rounded-2xl border-2 border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none focus:border-navy focus:bg-white transition-colors"
          />
          <ul className="space-y-2">
            {posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase())).map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full text-left px-4 py-4 rounded-2xl border-2 transition-colors ${
                    selectedId === p.id
                      ? 'border-navy bg-navy/5 text-stone-900'
                      : 'border-stone-200 bg-white text-stone-800 hover:border-steel hover:bg-teal/30'
                  }`}
                >
                  <span className="font-bold block text-sm">{p.title}</span>
                  <span className="text-xs text-stone-400 mt-1 block">
                    <span className="font-semibold text-stone-600">{p.authorUsername}</span>
                    {' · '}
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border-2 border-stone-200 bg-white p-6 md:p-8 min-h-[320px] shadow-sm">
          {!detail && <p className="text-stone-400 text-sm">Select a post to read.</p>}
          {detail && (
            <>
              <h2 className="text-2xl font-black text-stone-900">{detail.title}</h2>
              <p className="text-stone-400 text-sm mt-1 mb-5">
                <span className="font-bold text-navy">{detail.authorUsername}</span>
                {' · '}
                {new Date(detail.createdAt).toLocaleString()}
              </p>
              <div className="text-stone-700 whitespace-pre-wrap text-sm leading-relaxed">{detail.body}</div>

              <div className="mt-8 border-t border-stone-100 pt-6">
                <h3 className="text-stone-900 font-black text-sm uppercase tracking-wide mb-4">Comments</h3>
                <ul className="space-y-3 mb-5">
                  {detail.comments.map((c) => (
                    <li key={c.id} className="text-sm rounded-2xl bg-teal border border-teal p-4">
                      <span className="font-black text-navy text-xs uppercase tracking-wide">{c.authorUsername}</span>
                      <p className="text-stone-700 mt-1.5">{c.body}</p>
                    </li>
                  ))}
                </ul>
                <form onSubmit={addComment} className="space-y-2">
                  <textarea
                    placeholder="Add a comment…"
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    rows={2}
                    className="w-full rounded-2xl border-2 border-stone-200 bg-stone-50 px-3 py-2.5 text-stone-900 text-sm outline-none focus:border-navy focus:bg-white transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-stone-900 text-white text-sm font-bold px-5 py-2.5 hover:bg-navy transition-colors"
                  >
                    Post comment
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
