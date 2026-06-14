import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clearSession } from '../api/client';

interface NavbarProps {
  onLogout: () => void;
}

function readStoredName(): string {
  try {
    const raw = localStorage.getItem('loggedUser');
    if (!raw) return '';
    const o = JSON.parse(raw) as { username?: string };
    return o.username?.trim() || '';
  } catch { return ''; }
}

function readStoredRole(): string {
  try {
    const raw = localStorage.getItem('loggedUser') || sessionStorage.getItem('loggedUser');
    if (!raw) return '';
    const o = JSON.parse(raw) as { role?: string };
    return o.role?.trim() || '';
  } catch { return ''; }
}

const NAV_LINKS = [
  { path: '/',          label: 'Home' },
  { path: '/quizzes',   label: 'Quizzes' },
  { path: '/events',    label: 'Events' },
  { path: '/blog',      label: 'Blog' },
  { path: '/resources', label: 'Resources' },
  { path: '/profile',   label: 'Profile' },
];

const Navbar = ({ onLogout }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const displayName = useMemo(() => readStoredName(), [location.pathname]);
  const isAdmin = useMemo(() => readStoredRole() === 'ADMIN', [location.pathname]);

  const handleLogout = () => { clearSession(); onLogout(); };

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="text-lg font-black text-navy tracking-tight shrink-0">
            English Era
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ path, label }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-navy text-white'
                      : 'text-stone-600 hover:text-navy hover:bg-steel/20'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin"
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  location.pathname === '/admin'
                    ? 'bg-sun text-stone-900'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-sun/40'
                }`}
              >
                Admin Panel
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="ml-3 rounded-full border-2 border-stone-200 text-stone-500 px-4 py-2 text-sm font-bold hover:border-coral/50 hover:text-coral transition-colors"
            >
              Log out
            </button>
          </div>

          {/* Mobile: name + hamburger */}
          <div className="md:hidden flex items-center gap-3">
            {displayName && (
              <span className="text-sm font-semibold text-stone-500 truncate max-w-[7rem]">{displayName}</span>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full border border-stone-200 text-stone-600 hover:border-navy/30"
            >
              <span className="sr-only">Menu</span>
              {!isOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white px-4 pb-4 pt-2 space-y-1">
          {NAV_LINKS.map(({ path, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`block rounded-xl px-4 py-3 font-semibold transition-colors ${
                  active ? 'bg-navy text-white' : 'text-stone-700 hover:bg-steel/15 hover:text-navy'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              className="block rounded-xl px-4 py-3 font-bold text-stone-900 bg-sun/30 hover:bg-sun/50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Admin Panel
            </Link>
          )}
          <button
            type="button"
            onClick={() => { setIsOpen(false); handleLogout(); }}
            className="w-full text-left rounded-xl px-4 py-3 font-bold text-coral/80 hover:text-coral"
          >
            Log out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
