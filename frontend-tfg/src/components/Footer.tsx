import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-20 bg-navy text-white">
      {/* Top accent line */}
      <div className="h-1 w-full bg-steel" />

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <p className="text-xl font-black tracking-tight text-white uppercase mb-1">English Era</p>
            <p className="text-steel text-xs font-bold uppercase tracking-widest mb-4">Learning Platform</p>
            <p className="text-white/45 text-sm leading-relaxed">
              A focused hub for CEFR-aligned quizzes, curated materials, blog posts and real events across Spain — built for English learners at every level.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span className="rounded-full bg-steel/20 border border-steel/30 px-3 py-1 text-xs font-bold text-steel">A1 – C2</span>
              <span className="rounded-full bg-sun/15 border border-sun/20 px-3 py-1 text-xs font-bold text-sun">Free to use</span>
            </div>
          </div>

          {/* Learn */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Learn</p>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/quizzes" className="text-white/60 hover:text-white transition-colors font-medium">
                  Quizzes
                </Link>
                <p className="text-white/25 text-xs mt-0.5">Grammar, vocabulary & idioms</p>
              </li>
              <li>
                <Link to="/resources" className="text-white/60 hover:text-white transition-colors font-medium">
                  Materials
                </Link>
                <p className="text-white/25 text-xs mt-0.5">Grammar guides & dictionaries</p>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Community</p>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/events" className="text-white/60 hover:text-white transition-colors font-medium">
                  Events
                </Link>
                <p className="text-white/25 text-xs mt-0.5">Talks, book clubs & meetups in Spain</p>
              </li>
              <li>
                <Link to="/blog" className="text-white/60 hover:text-white transition-colors font-medium">
                  Blog
                </Link>
                <p className="text-white/25 text-xs mt-0.5">Culture, tips & learning posts</p>
              </li>
            </ul>
          </div>

          {/* Account + CEFR info */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">Account</p>
            <ul className="space-y-3 text-sm mb-6">
              <li>
                <Link to="/login" className="text-white/60 hover:text-white transition-colors font-medium">
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-white/60 hover:text-white transition-colors font-medium">
                  Create account
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-white/60 hover:text-white transition-colors font-medium">
                  My profile
                </Link>
              </li>
            </ul>
            <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
              <p className="text-xs font-bold text-white/60 mb-1">CEFR Aligned</p>
              <p className="text-xs text-white/30 leading-relaxed">
                All content follows the Common European Framework of Reference for Languages (A1–C2).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/25">
          <p>© 2026 English Era — All rights reserved</p>
          <p className="text-white/15">
            Developed as a 2º DAM Final Degree Project (TFG)
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
