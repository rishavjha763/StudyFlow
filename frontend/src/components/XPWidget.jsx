import { FiZap } from 'react-icons/fi';

// Shows current level and a progress bar toward the next level
export default function XPWidget({ xpData }) {
  if (!xpData) return null;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FiZap className="text-amber-500" /> Level {xpData.level}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">{xpData.xp} XP total</span>
      </div>

      <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${xpData.progressPercent}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        {xpData.xpIntoLevel} / {xpData.xpForNextLevel} XP to level {xpData.level + 1}
      </p>
    </div>
  );
}
