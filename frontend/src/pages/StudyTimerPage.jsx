import { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import StudyTimer from "../components/StudyTimer";
import api from "../services/api";

function formatHoursMinutes(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export default function StudyTimerPage() {
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);

  async function loadData() {
    const [historyRes, summaryRes] = await Promise.all([
      api.get("/timer/history"),
      api.get("/timer/summary"),
    ]);
    setHistory(historyRes.data.history);
    setSummary(summaryRes.data);
  }

  useEffect(() => {
    async function initialize() {
      await loadData();
    }

    initialize();
  }, []);

  return (
    <AppLayout section="Workspace" title="Focus Timer">
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <StudyTimer onSessionSaved={loadData} />
          <div className="grid grid-cols-2 gap-4 content-start">
            <div className="card">
              <p className="text-xs text-gray-400 mb-1">Today</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {summary ? formatHoursMinutes(summary.todaySeconds) : "—"}
              </p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-400 mb-1">This week</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {summary ? formatHoursMinutes(summary.weekSeconds) : "—"}
              </p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-400 mb-1">Lifetime</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {summary ? formatHoursMinutes(summary.lifetimeSeconds) : "—"}
              </p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-400 mb-1">Longest session</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {summary
                  ? formatHoursMinutes(summary.longestSessionSeconds)
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Daily history
          </h3>
          {history.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No sessions logged yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-800">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Total time</th>
                    <th className="pb-2 font-medium">Sessions</th>
                    <th className="pb-2 font-medium">Commits</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((day) => (
                    <tr
                      key={day.date}
                      className="border-b border-gray-50 dark:border-gray-900"
                    >
                      <td className="py-2 text-gray-700 dark:text-gray-200">
                        {day.date}
                      </td>
                      <td className="py-2 text-gray-700 dark:text-gray-200">
                        {formatHoursMinutes(day.totalStudySeconds)}
                      </td>
                      <td className="py-2 text-gray-700 dark:text-gray-200">
                        {day.sessionCount}
                      </td>
                      <td className="py-2 text-gray-700 dark:text-gray-200">
                        {day.commitCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
