import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGraduationCap } from 'react-icons/fa';
import { FiUser, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/useAuth';
import CelebrationModal from '../components/CelebrationModal';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [welcomeName, setWelcomeName] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const user = await register(fullName, email, password);
      setWelcomeName(user.fullName?.split(' ')[0] || 'there');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create account, please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gray-50 dark:bg-gray-950">
      <div className="hidden lg:flex flex-col justify-between bg-[#050807] text-white p-12 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.18), transparent 60%)' }}
        />
        <Link to="/" className="relative flex items-center gap-2 font-semibold font-heading">
          <span className="w-8 h-8 rounded-lg bg-primary-500/15 text-primary-400 flex items-center justify-center">
            <FaGraduationCap size={16} />
          </span>
          StudyFlow
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative"
        >
          <h1 className="text-3xl font-bold leading-tight">
            Your next 100 hours of studying starts here.
          </h1>
          <p className="text-gray-400 mt-4 font-sans max-w-sm">
            Timer, streaks, XP, and revisions — one dashboard, thirty seconds to set up.
          </p>
        </motion.div>

        <p className="relative text-xs text-gray-500 font-sans">&copy; {new Date().getFullYear()} StudyFlow</p>
      </div>

      <div className="relative flex items-center justify-center px-4 sm:px-6 py-12 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 80% 20%, rgba(16,185,129,0.12), transparent 55%)' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="relative w-full max-w-sm bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 p-8"
        >
          <div className="lg:hidden flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-8 font-heading">
            <span className="w-8 h-8 rounded-lg bg-primary-500/15 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <FaGraduationCap size={16} />
            </span>
            StudyFlow
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-sans">Start building your study habit today.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300 mb-1.5 block">Full name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field pl-10 bg-white/80 dark:bg-gray-800/80" placeholder="Jane Doe" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300 mb-1.5 block">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10 bg-white/80 dark:bg-gray-800/80" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300 mb-1.5 block">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10 bg-white/80 dark:bg-gray-800/80" placeholder="At least 6 characters" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
              {loading ? 'Creating account...' : (<>Create account <FiArrowRight size={16} /></>)}
            </button>
          </form>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center font-sans">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium">Log in</Link>
          </p>
        </motion.div>
      </div>

      <CelebrationModal
        open={!!welcomeName}
        title={`Welcome to StudyFlow, ${welcomeName}!`}
        message="Your dashboard is ready. Let's start your first streak."
        onClose={() => navigate('/dashboard', { replace: true })}
      />
    </div>
  );
}
