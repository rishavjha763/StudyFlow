import { useAuth } from '../context/useAuth';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// The big hero widget at the top of the dashboard.
// "Quick start session" scrolls down to the real timer instead of duplicating timer logic here.
export default function WelcomeWidget({ xpData, stats }) {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || 'there';
  const goalHours = stats?.dailyGoalHours ?? 2;

  function handleQuickStart() {
    document.getElementById('study-timer-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-white dark:from-primary-500/10 dark:to-gray-900 border border-primary-100 dark:border-primary-500/20 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{getGreeting()},</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-0.5">
            {firstName}. Ready to make today count?
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Your goal today: <span className="font-medium text-gray-700 dark:text-gray-200">Study {goalHours} hours</span>
          </p>
        </div>
        <button onClick={handleQuickStart} className="btn-primary whitespace-nowrap self-start">
          Quick start session
        </button>
      </div>

      {xpData ? (
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-6">
          <div>
            <p className="text-xs text-gray-400">XP</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{xpData.xp}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Level</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{xpData.level}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Streak</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stats?.studyStreak ?? 0} days</p>
          </div>
          <div className="flex-1 min-w-[160px]">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Level {xpData.level}</span>
              <span>{xpData.xpIntoLevel} / {xpData.xpForNextLevel} XP</span>
            </div>
            <div className="w-full h-2 bg-white dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${xpData.progressPercent}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-6">
          <div className="skeleton h-10 w-16" />
          <div className="skeleton h-10 w-16" />
          <div className="skeleton h-10 w-16" />
          <div className="skeleton h-8 flex-1 min-w-[160px]" />
        </div>
      )}
    </div>
  );
}
