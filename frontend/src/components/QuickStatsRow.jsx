import { FiClock, FiTrendingUp, FiZap, FiFlag } from 'react-icons/fi';

function formatHoursMinutes(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
}

export default function QuickStatsRow({ stats }) {
  if (!stats) {
    return (
      <div className="grid sm:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card">
            <div className="skeleton h-3 w-20 mb-3" />
            <div className="skeleton h-7 w-24 mb-2" />
            <div className="skeleton h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  const weeklyGoalHours = (stats.dailyGoalHours ?? 2) * 7;

  return (
    <div className="grid sm:grid-cols-4 gap-4">
      <div className="card">
        <div className="flex items-center justify-between text-xs font-medium tracking-wide text-gray-400 mb-2">
          TODAY <FiClock size={14} />
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatHoursMinutes(stats.todayStudySeconds)}</p>
        <p className="text-xs text-gray-400 mt-1">
          {stats.todayStudySeconds > 0 ? 'Keep it going' : 'Start a session'}
        </p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between text-xs font-medium tracking-wide text-gray-400 mb-2">
          THIS WEEK <FiTrendingUp size={14} />
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatHoursMinutes(stats.weekStudySeconds)}</p>
        <p className="text-xs text-gray-400 mt-1">Weekly goal {weeklyGoalHours}h</p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between text-xs font-medium tracking-wide text-gray-400 mb-2">
          COMMITS TODAY <FiZap size={14} />
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayCommits}</p>
        <p className="text-xs text-gray-400 mt-1">+1 to keep streak</p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between text-xs font-medium tracking-wide text-gray-400 mb-2">
          STREAK <FiFlag size={14} />
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.studyStreak} days</p>
        <p className="text-xs text-gray-400 mt-1">
          {stats.studyStreak > 0 ? 'Two freeze days a month' : 'Log today to start'}
        </p>
      </div>
    </div>
  );
}
