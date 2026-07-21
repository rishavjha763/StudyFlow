import { useEffect, useState } from 'react';
import { FiCalendar, FiLock, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import AppLayout from '../components/AppLayout';
import RevisionTopicCard from '../components/RevisionTopicCard';
import CelebrationModal from '../components/CelebrationModal';
import api from '../services/api';

export default function RevisionHubPage() {
  const [status, setStatus] = useState(null);
  const [sheet, setSheet] = useState(undefined); // undefined = loading, null = nothing to revise
  const [lang, setLang] = useState('en');
  const [error, setError] = useState('');
  const [completing, setCompleting] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: statusData } = await api.get('/revision-hub/status');
      setStatus(statusData);

      if (statusData.unlocked) {
        try {
          const { data } = await api.get('/revision-hub/current');
          setSheet(data.sheet);
        } catch (err) {
          setError(err.response?.data?.message || 'Could not load your revision sheet');
          setSheet(null);
        }
      }
    }
    load();
  }, []);

  async function handleComplete() {
    setCompleting(true);
    try {
      await api.post('/revision-hub/complete');
      setCelebrate(true);
    } catch (err) {
      setError('Could not mark this week complete, please try again');
    } finally {
      setCompleting(false);
    }
  }

  // Still checking whether today is an unlock day
  if (!status) {
    return (
      <AppLayout section="Workspace" title="Revision Hub">
        <div className="card"><div className="skeleton h-24" /></div>
      </AppLayout>
    );
  }

  // Locked — not Wednesday or Saturday
  if (!status.unlocked) {
    return (
      <AppLayout section="Workspace" title="Revision Hub">
        <div className="max-w-md mx-auto mt-8 text-center card py-12">
          <div className="w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-4">
            <FiLock size={22} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Revision Hub is resting today</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-sans">
            It unlocks every <span className="font-medium text-gray-700 dark:text-gray-200">Wednesday</span> and{' '}
            <span className="font-medium text-gray-700 dark:text-gray-200">Saturday</span> so you always have a
            real week of studying to review, not an empty page.
          </p>
          {status.nextUnlock && (
            <div className="mt-5 inline-flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full text-gray-600 dark:text-gray-300">
              <FiCalendar size={14} />
              Next unlock: {status.nextUnlock.label} ({status.nextUnlock.daysUntil} day{status.nextUnlock.daysUntil > 1 ? 's' : ''})
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // Unlocked, still generating
  if (sheet === undefined) {
    return (
      <AppLayout section="Workspace" title="Revision Hub">
        <div className="max-w-md mx-auto mt-8 text-center card py-12">
          <FiRefreshCw className="mx-auto mb-4 text-primary-600 dark:text-primary-400 animate-spin" size={28} />
          <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Analyzing your week...</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-sans">
            Looking at your notes, topics, and quiz scores to build your revision sheet. This can take a few seconds.
          </p>
        </div>
      </AppLayout>
    );
  }

  // Unlocked, but nothing studied this week
  if (!sheet) {
    return (
      <AppLayout section="Workspace" title="Revision Hub">
        <div className="max-w-md mx-auto mt-8 text-center card py-12">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">Nothing to revise yet this week</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-sans">
            {error || 'Study a topic, write a note, or take a quiz — come back and your revision sheet will be ready.'}
          </p>
        </div>
      </AppLayout>
    );
  }

  // The real thing — a full revision sheet
  return (
    <AppLayout section="Workspace" title="Revision Hub">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">This week's revision</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-sans">{sheet.topics.length} topic{sheet.topics.length !== 1 ? 's' : ''} from what you studied</p>
          </div>

          {/* Language toggle — switches every card on the page at once */}
          <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 self-start">
            <button
              onClick={() => setLang('en')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                lang === 'en' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                lang === 'hi' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {sheet.topics.map((topic, i) => (
            <RevisionTopicCard key={topic.topicName + i} topic={topic} lang={lang} defaultOpen={i === 0} />
          ))}
        </div>

        {/* Ready for Next Week? closing section */}
        <div className="rounded-2xl bg-primary-500/10 border border-primary-500/20 px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ready for next week?</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-sans max-w-sm mx-auto">
            {sheet.completed
              ? "You've reviewed this week's material. New topics will show up here as you keep studying."
              : "Mark this week reviewed once you've gone through everything above — it earns you XP and keeps your revision streak going."}
          </p>
          <button
            onClick={handleComplete}
            disabled={completing || sheet.completed}
            className="btn-primary inline-flex items-center gap-2 mt-6 disabled:opacity-60"
          >
            <FiCheckCircle />
            {sheet.completed ? 'Week reviewed' : completing ? 'Saving...' : 'Mark this week reviewed'}
          </button>
        </div>
      </div>

      <CelebrationModal
        open={celebrate}
        title="Week reviewed!"
        message="Great habit — consistent revision is what makes it stick."
        onClose={() => { setCelebrate(false); setSheet((s) => ({ ...s, completed: true })); }}
      />
    </AppLayout>
  );
}
