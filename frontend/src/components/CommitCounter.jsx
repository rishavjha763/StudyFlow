import { useEffect, useState } from "react";
import { FiGitCommit } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../services/api";

export default function CommitCounter() {
  const [summary, setSummary] = useState({
    todayCount: 0,
    weekCount: 0,
    monthCount: 0,
    lifetimeCount: 0,
  });
  const [loading, setLoading] = useState(false);

  async function fetchSummary() {
    const { data } = await api.get("/commits/summary");
    return data;
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await fetchSummary();
      if (mounted) setSummary(data);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleIncrement() {
    setLoading(true);
    try {
      await api.post("/commits/increment");
      await fetchSummary();
      toast.success("+1 commit logged");
    } catch {
      toast.error("Could not log that commit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FiGitCommit className="text-primary-600" /> Commits
        </h3>
        <button
          onClick={handleIncrement}
          disabled={loading}
          className="btn-primary text-sm"
        >
          +1 Commit
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {summary.todayCount}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {summary.weekCount}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">This week</p>
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {summary.lifetimeCount}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Lifetime</p>
        </div>
      </div>
    </div>
  );
}
