import { useEffect, useState } from 'react';
import { FiClock, FiEdit, FiHelpCircle, FiAward, FiBook, FiStar, FiLock } from 'react-icons/fi';
import { GiFlame } from 'react-icons/gi';
import AppLayout from '../components/AppLayout';
import api from '../services/api';

const ICONS = {
  clock: <FiClock />,
  edit: <FiEdit />,
  'help-circle': <FiHelpCircle />,
  flame: <GiFlame />,
  award: <FiAward />,
  book: <FiBook />,
  star: <FiStar />
};

export default function AchievementsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/achievements').then((res) => setData(res.data));
  }, []);

  return (
    <AppLayout section="Workspace" title="Achievements">
      <div className="space-y-6">
        <div className="card flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Your progress</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Unlocked automatically as you study, take notes, and complete quizzes.
            </p>
          </div>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {data ? `${data.unlockedCount}/${data.totalCount}` : '—'}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data?.achievements.map((a) => (
            <div
              key={a.key}
              className={`card text-center ${a.unlocked ? '' : 'opacity-50'}`}
            >
              <div
                className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${
                  a.unlocked
                    ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                }`}
              >
                {a.unlocked ? ICONS[a.icon] : <FiLock />}
              </div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{a.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{a.description}</p>
              {a.unlocked && (
                <p className="text-[10px] text-primary-600 dark:text-primary-400 mt-2">
                  Unlocked {new Date(a.unlockedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
