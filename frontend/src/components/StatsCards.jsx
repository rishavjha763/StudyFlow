import { FiClock, FiZap, FiFileText, FiTrendingUp } from "react-icons/fi";

function formatHoursMinutes(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

// A small reusable metric card, used for every number on the dashboard
function StatCard({ icon, label, value, accent }) {
  return (
    <div className="card flex items-center gap-4">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

export default function StatsCards({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        icon={<FiClock className="text-primary-600" />}
        label="Today's study time"
        value={formatHoursMinutes(stats.todayStudySeconds)}
        accent="bg-primary-50 dark:bg-primary-500/10"
      />
      <StatCard
        icon={<FiTrendingUp className="text-amber-600" />}
        label="Study streak"
        value={`${stats.studyStreak} days`}
        accent="bg-amber-50 dark:bg-amber-500/10"
      />
      <StatCard
        icon={<FiZap className="text-green-600" />}
        label="Total commits"
        value={stats.totalCommits}
        accent="bg-green-50 dark:bg-green-500/10"
      />
      <StatCard
        icon={<FiFileText className="text-purple-600" />}
        label="Notes written"
        value={stats.noteCount}
        accent="bg-purple-50 dark:bg-purple-500/10"
      />
      <StatCard
        icon={<FiClock className="text-primary-600" />}
        label="This week"
        value={formatHoursMinutes(stats.weekStudySeconds)}
        accent="bg-primary-50 dark:bg-primary-500/10"
      />
      <StatCard
        icon={<FiClock className="text-primary-600" />}
        label="This month"
        value={formatHoursMinutes(stats.monthStudySeconds)}
        accent="bg-primary-50 dark:bg-primary-500/10"
      />
      <StatCard
        icon={<FiClock className="text-primary-600" />}
        label="Lifetime study time"
        value={formatHoursMinutes(stats.lifetimeStudySeconds)}
        accent="bg-primary-50 dark:bg-primary-500/10"
      />
      <StatCard
        icon={<FiZap className="text-green-600" />}
        label="Longest session"
        value={formatHoursMinutes(stats.longestSessionSeconds)}
        accent="bg-green-50 dark:bg-green-500/10"
      />
    </div>
  );
}
