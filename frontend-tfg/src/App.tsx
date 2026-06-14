import { useCallback, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getAuthToken } from './api/client';
import Login from './pages/Login';
import Register from './pages/Register';
import HomePage from './pages/HomePage';
import Navbar from './pages/Navbar';
import QuizPage from './pages/QuizPage';
import ResourcesPage from './pages/ResourcesPage';
import BlogPage from './pages/BlogPage';
import ProfilePage from './pages/ProfilePage';
import EventsPage from './pages/EventsPage';
import AdminPage from './pages/AdminPage';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ChatWidget from './components/ChatWidget';

function AppContent({ isAuthenticated, syncAuth }: { isAuthenticated: boolean; syncAuth: () => void }) {
  const location = useLocation();
  const showChat = isAuthenticated && location.pathname !== '/quizzes';

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen text-stone-800">
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={syncAuth} />} />
          <Route path="/register" element={<Register onRegistered={syncAuth} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-stone-800 flex flex-col" style={{ background: 'linear-gradient(160deg, #FFF6DE 0%, #FFF0C8 50%, #FFF6DE 100%)' }}>
      <ScrollToTop />
      <Navbar onLogout={() => syncAuth()} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/quizzes" element={<QuizPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      {showChat && <ChatWidget />}
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAuthToken());

  const syncAuth = useCallback(() => {
    setIsAuthenticated(!!getAuthToken());
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'authToken') syncAuth();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [syncAuth]);

  return <AppContent isAuthenticated={isAuthenticated} syncAuth={syncAuth} />;
}

export default App;
