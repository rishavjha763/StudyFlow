import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiPlay } from "react-icons/fi";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import QuizBuilder from "../components/QuizBuilder";
import QuizPlayer from "../components/QuizPlayer";
import api from "../services/api";

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);

  async function loadData() {
    const [quizRes, statsRes] = await Promise.all([
      api.get("/quizzes"),
      api.get("/quizzes/stats"),
    ]);
    setQuizzes(quizRes.data.quizzes);
    setStats(statsRes.data);
  }

  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, []);

  async function handleDelete(id) {
    await api.delete(`/quizzes/${id}`);
    toast.success("Quiz deleted");
    loadData();
  }

  if (activeQuiz) {
    return (
      <AppLayout section="Workspace" title="Quizzes">
        <QuizPlayer
          quiz={activeQuiz}
          onFinished={loadData}
          onExit={() => setActiveQuiz(null)}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout section="Workspace" title="Quizzes">
      <div className="space-y-6">
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-xs text-gray-400">Total quizzes</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {stats?.totalQuizzes ?? 0}
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400">Average score</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {stats?.averageScore ?? 0}%
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400">Best score</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {stats?.bestScore ?? 0}%
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400">Recent quiz</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {stats?.recentResults?.[0]?.quizTitle || "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Your quizzes
          </h2>
          <button
            onClick={() => setShowBuilder((s) => !s)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <FiPlus /> New quiz
          </button>
        </div>

        {showBuilder && (
          <QuizBuilder
            onCreated={() => {
              setShowBuilder(false);
              loadData();
            }}
            onCancel={() => setShowBuilder(false)}
          />
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {quizzes.length === 0 && !showBuilder && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No quizzes yet — create one above.
            </p>
          )}
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {quiz.category} &middot; {quiz.questions.length} questions
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(quiz._id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
              <button
                onClick={() => setActiveQuiz(quiz)}
                className="btn-primary text-sm flex items-center gap-2 mt-2"
              >
                <FiPlay size={13} /> Start quiz
              </button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
