import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import StudyChart from "../components/StudyChart";
import api from "../services/api";

function formatHoursMinutes(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function MetricCard({ label, value }) {
  return (
    <div className="card">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
        {value}
      </p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [weeklyChart, setWeeklyChart] = useState([]);
  const [xpData, setXpData] = useState(null);
  const [quizStats, setQuizStats] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    async function load() {
      const [statsRes, chartRes, xpRes, quizRes, achRes, topicsRes] =
        await Promise.all([
          api.get("/stats/dashboard"),
          api.get("/stats/weekly-chart"),
          api.get("/xp/summary"),
          api.get("/quizzes/stats"),
          api.get("/achievements"),
          api.get("/topics"),
        ]);
      setStats(statsRes.data);
      setWeeklyChart(chartRes.data.weeklyChart);
      setXpData(xpRes.data);
      setQuizStats(quizRes.data);
      setAchievements(achRes.data);
      setTopics(topicsRes.data.topics);
    }
    load();
  }, []);

  return (
    <AppLayout section="Workspace" title="Analytics">
      <div className="space-y-6">
        <div className="grid sm:grid-cols-4 gap-4">
          <MetricCard
            label="Lifetime study time"
            value={stats ? formatHoursMinutes(stats.lifetimeStudySeconds) : "—"}
          />
          <MetricCard
            label="Study streak"
            value={stats ? `${stats.studyStreak} days` : "—"}
          />
          <MetricCard
            label="Total commits"
            value={stats?.totalCommits ?? "—"}
          />
          <MetricCard
            label="Longest session"
            value={
              stats ? formatHoursMinutes(stats.longestSessionSeconds) : "—"
            }
          />
        </div>

        <StudyChart data={weeklyChart} />

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              XP & level
            </h3>
            {xpData && (
              <>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span>Level {xpData.level}</span>
                  <span>
                    {xpData.xpIntoLevel} / {xpData.xpForNextLevel} XP
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${xpData.progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {xpData.xp} XP earned in total
                </p>
              </>
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Quiz performance
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {quizStats?.totalQuizzes ?? 0}
                </p>
                <p className="text-xs text-gray-400">Taken</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {quizStats?.averageScore ?? 0}%
                </p>
                <p className="text-xs text-gray-400">Average</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {quizStats?.bestScore ?? 0}%
                </p>
                <p className="text-xs text-gray-400">Best</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Topic progress
            </h3>
            {topics.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No topics yet.
              </p>
            )}
            <div className="space-y-3">
              {topics.map((t) => (
                <div key={t._id}>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>{t.name}</span>
                    <span>{t.completionPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${t.completionPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Achievements
            </h3>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {achievements
                ? `${achievements.unlockedCount}/${achievements.totalCount}`
                : "—"}
            </p>
            <p className="text-xs text-gray-400 mt-1">unlocked so far</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
