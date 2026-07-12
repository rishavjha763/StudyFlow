import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiDownload,
  FiAward,
  FiHelpCircle,
  FiArrowRight,
} from "react-icons/fi";
import AppLayout from "../components/AppLayout";
import WelcomeWidget from "../components/WelcomeWidget";
import QuickStatsRow from "../components/QuickStatsRow";
import StudyTimer from "../components/StudyTimer";
import CommitCounter from "../components/CommitCounter";
import StudyChart from "../components/StudyChart";
import TopicsList from "../components/TopicsList";
import QuickNotesWidget from "../components/QuickNotesWidget";
import RevisionWidget from "../components/RevisionWidget";
import { useFocusMode } from "../context/useFocusMode";
import api from "../services/api";

export default function DashboardPage() {
  const { focusMode } = useFocusMode();
  const [stats, setStats] = useState(null);
  const [weeklyChart, setWeeklyChart] = useState([]);
  const [xpData, setXpData] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [quizStats, setQuizStats] = useState(null);

  async function loadDashboard(isMounted = () => true) {
    const [statsRes, chartRes, xpRes, achRes, quizRes] = await Promise.all([
      api.get("/stats/dashboard"),
      api.get("/stats/weekly-chart"),
      api.get("/xp/summary"),
      api.get("/achievements"),
      api.get("/quizzes/stats"),
    ]);
    if (!isMounted()) return;
    setStats(statsRes.data);
    setWeeklyChart(chartRes.data.weeklyChart);
    setXpData(xpRes.data);
    setAchievements(achRes.data);
    setQuizStats(quizRes.data);
  }

  useEffect(() => {
    let mounted = true;
    async function init() {
      await loadDashboard(() => mounted);
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleExport() {
    const res = await api.get("/stats/export-csv", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "study-history.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  // Focus Mode: hide every "unnecessary" dashboard widget (stats, commits,
  // charts, notes, achievements) and show only the timer, centered and calm.
  // This is also what fixes the Commits button being unresponsive in focus
  // mode before — that whole multi-column grid simply doesn't render now.
  if (focusMode) {
    return (
      <AppLayout section="Focus Mode" title="Deep work">
        <div className="max-w-md mx-auto pt-8">
          <StudyTimer onSessionSaved={() => {}} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout section="Workspace" title="Dashboard">
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.08 }}
      >
        <motion.div variants={fadeUp} transition={{ duration: 0.35 }}>
          <WelcomeWidget xpData={xpData} stats={stats} />
        </motion.div>

        <motion.div variants={fadeUp} transition={{ duration: 0.35 }}>
          <QuickStatsRow stats={stats} />
        </motion.div>

        <motion.div
          id="study-timer-section"
          variants={fadeUp}
          transition={{ duration: 0.35 }}
          className="grid lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-1 space-y-6">
            <StudyTimer onSessionSaved={loadDashboard} />
            <CommitCounter />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <StudyChart data={weeklyChart} />
            <TopicsList />
            <RevisionWidget />
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-between"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white">
            More on your dashboard
          </h2>
          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <FiDownload /> Export CSV
          </button>
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.35 }}
          className="grid sm:grid-cols-3 gap-4"
        >
          <QuickNotesWidget />

          <Link
            to="/achievements"
            className="card block hover:border-primary-300 dark:hover:border-primary-500/40 hover:-translate-y-0.5 transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-3">
              <FiAward />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Achievements
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {achievements
                ? `${achievements.unlockedCount}/${achievements.totalCount}`
                : "—"}
            </p>
            <p className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1 mt-2">
              View all <FiArrowRight size={12} />
            </p>
          </Link>

          <Link
            to="/quizzes"
            className="card block hover:border-primary-300 dark:hover:border-primary-500/40 hover:-translate-y-0.5 transition-all"
          >
            <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-3">
              <FiHelpCircle />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Quizzes
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {quizStats ? `${quizStats.averageScore}% avg` : "—"}
            </p>
            <p className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1 mt-2">
              Take a quiz <FiArrowRight size={12} />
            </p>
          </Link>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
