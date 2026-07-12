import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiPlay, FiZap, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import QuizBuilder from "../components/QuizBuilder";
import QuizPlayer from "../components/QuizPlayer";
import ConfirmModal from "../components/ConfirmModal";
import api from "../services/api";

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const [topics, setTopics] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  async function loadData() {
    const [quizRes, statsRes, topicsRes] = await Promise.all([
      api.get("/quizzes"),
      api.get("/quizzes/stats"),
      api.get("/topics"),
    ]);
    setQuizzes(quizRes.data.quizzes);
    setStats(statsRes.data);
    setTopics(topicsRes.data.topics);
  }

  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, []);

  async function handleDelete(id) {
    await api.delete(`/quizzes/${id}`);
    toast.success("Quiz deleted");
    setConfirmDeleteId(null);
    loadData();
  }

  async function handleGenerate() {
    if (!selectedTopic) {
      toast.error("Pick a topic first");
      return;
    }
    setGenerating(true);
    try {
      await api.post("/quizzes/generate", {
        topicName: selectedTopic,
        difficulty: "Medium",
      });
      toast.success(`Quiz generated for ${selectedTopic}`);
      setSelectedTopic("");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not generate quiz");
    } finally {
      setGenerating(false);
    }
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

        {/* AI auto-generate from a studied topic */}
        <div className="card bg-gradient-to-br from-primary-50 to-white dark:from-primary-500/10 dark:to-gray-900 border-primary-100 dark:border-primary-500/20">
          <div className="flex items-center gap-2 mb-1">
            <FiZap className="text-primary-600 dark:text-primary-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Generate a quiz from what you studied
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-sans">
            Pick a topic and AI builds 5 questions to test yourself on it.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="input-field sm:max-w-xs"
            >
              <option value="">Select a topic...</option>
              {topics.map((t) => (
                <option key={t._id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              {generating ? <FiLoader className="animate-spin" /> : <FiZap />}
              {generating ? "Generating..." : "Generate quiz"}
            </button>
          </div>
          {topics.length === 0 && (
            <p className="text-xs text-gray-400 mt-2 font-sans">
              Add a topic on the Topics page first to generate a quiz from it.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Your quizzes
          </h2>
          <button
            onClick={() => setShowBuilder((s) => !s)}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <FiPlus /> Build manually
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
            <p className="text-sm text-gray-500 dark:text-gray-400 font-sans">
              No quizzes yet — generate one above or build one manually.
            </p>
          )}
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="card hover:-translate-y-0.5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-sans">
                    {quiz.category} &middot; {quiz.questions.length} questions
                  </p>
                </div>
                <button
                  onClick={() => setConfirmDeleteId(quiz._id)}
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

      <ConfirmModal
        open={!!confirmDeleteId}
        title="Delete this quiz?"
        message="Your past results for it will stay in your history, but you won't be able to take it again."
        onConfirm={() => handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </AppLayout>
  );
}
