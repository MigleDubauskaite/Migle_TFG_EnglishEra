import { useEffect, useState } from 'react';
import { apiGet, apiPost, getAuthToken } from '../api/client';

interface AppEvent {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  online: boolean;
  eventDate: string | null;
  createdBy: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  TALK: 'Talk',
  BOOK_CLUB: 'Book Club',
  FILM: 'Film',
  TRAVEL: 'Travel',
  OTHER: 'Other',
};

const CATEGORY_COLORS: Record<string, string> = {
  TALK:      'bg-navy/10 text-navy border-navy/20',
  BOOK_CLUB: 'bg-teal border-teal text-navy',
  FILM:      'bg-sun/40 text-stone-800 border-sun/50',
  TRAVEL:    'bg-peach/40 text-stone-800 border-peach/60',
  OTHER:     'bg-sage border-sage text-stone-700',
};

function isAdmin(): boolean {
  try {
    const raw = localStorage.getItem('loggedUser') || sessionStorage.getItem('loggedUser');
    if (!raw) return false;
    const o = JSON.parse(raw) as { role?: string };
    return o.role === 'ADMIN';
  } catch { return false; }
}

const EventsPage = () => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const admin = isAdmin();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('TALK');
  const [location, setLocation] = useState('');
  const [online, setOnline] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await apiGet<AppEvent[]>('/api/events', false);
      setEvents(data);
    } catch {
      setError('Could not load events.');
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiPost('/api/events', { title, description, category, location, online, eventDate });
      setTitle(''); setDescription(''); setCategory('TALK'); setLocation(''); setOnline(false); setEventDate('');
      setShowForm(false);
      await load();
    } catch {
      setError('Could not create event.');
    } finally {
      setSaving(false);
    }
  };

  const upcoming = events.filter(ev => ev.eventDate && new Date(ev.eventDate) >= new Date(new Date().toDateString()));
  const past = events.filter(ev => !ev.eventDate || new Date(ev.eventDate) < new Date(new Date().toDateString()));

  const inputClass = "w-full rounded-2xl border-2 border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none focus:border-navy focus:bg-white transition-colors text-sm";

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-navy/50 mb-2">Live & in-person</p>
          <h1 className="text-3xl md:text-4xl font-black text-stone-900">English Events</h1>
          <p className="mt-3 text-stone-500 max-w-xl leading-relaxed text-sm">
            Talks, book clubs, film nights and coastal walks — real activities across Spain to practise English beyond the screen.
          </p>
        </div>
        {admin && getAuthToken() && (
          <button
            type="button"
            onClick={() => setShowForm(v => !v)}
            className="rounded-full bg-navy text-white font-bold px-5 py-2.5 text-sm shadow-sm hover:bg-navy/85 transition-colors shrink-0"
          >
            {showForm ? 'Cancel' : '+ Add event'}
          </button>
        )}
      </div>

      {error && <p className="mt-4 text-coral font-semibold text-sm">{error}</p>}

      {/* Admin create form */}
      {showForm && admin && (
        <form onSubmit={handleCreate} className="mt-8 rounded-3xl bg-white border-2 border-stone-200 p-6 md:p-8 shadow-sm space-y-4">
          <h2 className="text-sm font-black text-stone-900 uppercase tracking-wide">New event</h2>
          <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className={inputClass} />
          <textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={3} className={inputClass} />
          <div className="grid grid-cols-2 gap-4">
            <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>
              <option value="TALK">Talk</option>
              <option value="BOOK_CLUB">Book Club</option>
              <option value="FILM">Film</option>
              <option value="TRAVEL">Travel</option>
              <option value="OTHER">Other</option>
            </select>
            <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className={inputClass} />
          </div>
          <input required value={location} onChange={e => setLocation(e.target.value)} placeholder="Location or 'Online (Zoom)'…" className={inputClass} />
          <label className="flex items-center gap-3 text-sm font-semibold text-stone-600 cursor-pointer">
            <input type="checkbox" checked={online} onChange={e => setOnline(e.target.checked)} className="w-4 h-4 accent-navy" />
            This is an online event
          </label>
          <button type="submit" disabled={saving}
            className="rounded-full bg-navy text-white font-bold px-6 py-3 text-sm hover:bg-navy/85 transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Publish event'}
          </button>
        </form>
      )}

      {/* Upcoming events */}
      <section className="mt-12">
        <div className="flex items-baseline gap-3 mb-6">
          <h2 className="text-sm font-black text-stone-900 uppercase tracking-wide">Upcoming</h2>
          {upcoming.length > 0 && (
            <span className="rounded-full bg-navy text-white text-xs font-black px-2.5 py-0.5">{upcoming.length}</span>
          )}
        </div>
        {upcoming.length === 0 && (
          <p className="text-stone-400 text-sm">No upcoming events right now. Check back soon.</p>
        )}
        <div className="space-y-5">
          {upcoming.map(ev => <EventCard key={ev.id} ev={ev} />)}
        </div>
      </section>

      {past.length > 0 && (
        <section className="mt-14">
          <h2 className="text-sm font-black text-stone-400 uppercase tracking-wide mb-6">Past events</h2>
          <div className="space-y-4 opacity-60">
            {past.map(ev => <EventCard key={ev.id} ev={ev} past />)}
          </div>
        </section>
      )}
    </div>
  );
};

function EventCard({ ev, past = false }: { ev: AppEvent; past?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const catColor = CATEGORY_COLORS[ev.category] ?? CATEGORY_COLORS.OTHER;
  const catLabel = CATEGORY_LABELS[ev.category] ?? ev.category;

  const date = ev.eventDate ? new Date(ev.eventDate) : null;
  const day   = date ? date.toLocaleDateString('en-GB', { day: 'numeric' }) : null;
  const month = date ? date.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase() : null;
  const weekday = date ? date.toLocaleDateString('en-GB', { weekday: 'long' }) : null;
  const time = date ? date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : null;

  const accentColor =
    ev.category === 'TALK'      ? 'bg-navy' :
    ev.category === 'BOOK_CLUB' ? 'bg-steel' :
    ev.category === 'FILM'      ? 'bg-sun' :
    ev.category === 'TRAVEL'    ? 'bg-peach' :
    'bg-sage';

  return (
    <article className={`rounded-3xl border-2 bg-white shadow-sm overflow-hidden transition-all ${
      past
        ? 'border-stone-100 opacity-70'
        : expanded
        ? 'border-navy/30 shadow-md'
        : 'border-stone-200 hover:border-steel hover:shadow-md'
    }`}>
      {/* Top accent strip */}
      <div className={`h-1 w-full ${accentColor}`} />

      <div className="flex gap-0">
        {/* Calendar date block */}
        {date && (
          <div className={`flex-none flex flex-col items-center justify-center w-20 md:w-24 border-r py-6 shrink-0 ${
            past ? 'border-stone-100 bg-stone-50' : 'border-stone-200 bg-stone-50'
          }`}>
            <span className="text-3xl font-black text-navy tabular-nums leading-none">{day}</span>
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-1">{month}</span>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-black ${catColor}`}>{catLabel}</span>
            {ev.online && (
              <span className="rounded-full bg-steel/15 text-navy border border-steel/20 px-2.5 py-0.5 text-xs font-bold">
                Online
              </span>
            )}
          </div>

          <h3 className="text-lg md:text-xl font-black text-stone-900 leading-snug">{ev.title}</h3>

          <p className={`text-stone-500 mt-2 leading-relaxed text-sm ${expanded ? '' : 'line-clamp-2'}`}>
            {ev.description}
          </p>

          {/* Expanded details */}
          {expanded && (
            <div className="mt-4 space-y-3 border-t border-stone-100 pt-4">
              {weekday && time && (
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <span className="text-stone-400">🗓</span>
                  <span className="font-semibold">{weekday}</span>
                  <span className="text-stone-400">·</span>
                  <span>{time}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <span className="text-stone-400">📍</span>
                <span>{ev.location}</span>
              </div>
              {ev.online && (
                <div className="rounded-2xl bg-steel/8 border border-steel/20 px-4 py-3">
                  <p className="text-xs font-bold text-navy">This is an online event — a link will be shared before the session.</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            {!expanded && (
              <p className="text-xs text-stone-400 font-medium flex items-center gap-1">
                <span className="w-3 h-3 rounded-full border border-stone-300 inline-flex items-center justify-center shrink-0" aria-hidden="true">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                </span>
                {ev.location}
              </p>
            )}
            {!past && (
              <button
                type="button"
                onClick={() => setExpanded(v => !v)}
                className={`ml-auto text-xs font-bold transition-colors ${
                  expanded ? 'text-navy hover:text-navy/70' : 'text-stone-400 hover:text-navy'
                }`}
              >
                {expanded ? 'Show less ▲' : 'See more ▼'}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default EventsPage;
