import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaGraduationCap } from 'react-icons/fa';
import {
  FiGrid, FiClock, FiBookOpen, FiEdit3, FiBarChart2, FiAward, FiHelpCircle, FiUser, FiLogOut, FiX
} from 'react-icons/fi';
import { useAuth } from '../context/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: <FiGrid /> },
  { to: '/study-timer', label: 'Focus Timer', icon: <FiClock /> },
  { to: '/topics', label: 'Topics', icon: <FiBookOpen /> },
  { to: '/notes', label: 'Notes', icon: <FiEdit3 /> },
  { to: '/analytics', label: 'Analytics', icon: <FiBarChart2 /> },
  { to: '/achievements', label: 'Achievements', icon: <FiAward /> },
  { to: '/quizzes', label: 'Quizzes', icon: <FiHelpCircle /> },
  { to: '/profile', label: 'Profile', icon: <FiUser /> }
];

// The backend serves uploaded images from /uploads, but axios's baseURL ends in /api,
// so we strip /api off to build the correct image URL.
const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    // Navigate FIRST, then clear auth state. If we cleared state first, this
    // page (still mounted for a moment) is wrapped in ProtectedRoute, which
    // would notice "no user" and redirect to /login before our own
    // navigate('/') call could take effect — a race that sent people to the
    // login page instead of the landing page. Navigating first avoids that,
    // and `replace: true` stops the old protected page from sitting in
    // browser history (so the back button won't step through it).
    navigate('/', { replace: true });
    logout();
  }

  return (
    <>
      {/* Backdrop, mobile only, shown while the drawer is open */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 sm:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-64 shrink-0 h-screen fixed sm:sticky top-0 flex flex-col border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 z-40 transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between gap-2 px-5 font-semibold text-gray-900 dark:text-white">
          <span className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary-500/15 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <FaGraduationCap size={14} />
            </span>
            StudyFlow
          </span>
          <button onClick={onClose} className="sm:hidden text-gray-400" aria-label="Close menu">
            <FiX size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-semibold overflow-hidden shrink-0">
            {user?.profileImage ? (
              <img
                src={`${API_ORIGIN}${user.profileImage}`}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              user?.fullName?.charAt(0).toUpperCase() || '?'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-400">Level {user?.level || 1} &middot; {user?.xp || 0} XP</p>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 shrink-0" aria-label="Log out">
            <FiLogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
