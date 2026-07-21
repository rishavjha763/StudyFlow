import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import StudyTimerPage from './pages/StudyTimerPage';
import TopicsPage from './pages/TopicsPage';
import NotesPage from './pages/NotesPage';
import RevisionHubPage from './pages/RevisionHubPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AchievementsPage from './pages/AchievementsPage';
import QuizzesPage from './pages/QuizzesPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { useFocusMode } from './context/useFocusMode';

function Protected({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  const { notificationsMuted } = useFocusMode();

  return (
    <>
      {/* Toasts still fire in code as normal even when muted — we just hide the
          container visually, so no individual toast.success()/error() call
          anywhere in the app needs to know or care about focus mode. */}
      <Toaster
        position="top-right"
        containerStyle={notificationsMuted ? { display: 'none' } : undefined}
        toastOptions={{ style: { fontSize: '14px' } }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
        <Route path="/study-timer" element={<Protected><StudyTimerPage /></Protected>} />
        <Route path="/topics" element={<Protected><TopicsPage /></Protected>} />
        <Route path="/notes" element={<Protected><NotesPage /></Protected>} />
        <Route path="/revision-hub" element={<Protected><RevisionHubPage /></Protected>} />
        <Route path="/analytics" element={<Protected><AnalyticsPage /></Protected>} />
        <Route path="/achievements" element={<Protected><AchievementsPage /></Protected>} />
        <Route path="/quizzes" element={<Protected><QuizzesPage /></Protected>} />
        <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
