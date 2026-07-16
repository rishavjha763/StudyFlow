import { useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../services/api";
import CelebrationModal from "./CelebrationModal";

// Shows one quiz's questions with radio options, submits all answers at once,
// then displays the score and which answers were right/wrong.
export default function QuizPlayer({ quiz, onFinished, onExit }) {
  const [answers, setAnswers] = useState(
    Array(quiz.questions.length).fill(null),
  );
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  function selectAnswer(qIndex, optIndex) {
    setAnswers((prev) => prev.map((a, i) => (i === qIndex ? optIndex : a)));
  }

  async function handleSubmit() {
    if (answers.some((a) => a === null)) {
      toast.error("Answer every question before submitting");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/quizzes/${quiz._id}/submit`, {
        answers,
      });
      setResult(data);

      const percent = Math.round((data.score / data.totalQuestions) * 100);
      if (percent >= 70) {
        setShowCelebration(true);
      } else {
        toast.success(
          `Scored ${data.score}/${data.totalQuestions} (+${data.xp?.xpAwarded || 0} XP)`,
        );
      }
      if (data.newAchievements?.length > 0) {
        data.newAchievements.forEach((a) =>
          toast(`Achievement unlocked: ${a.title}`, { icon: "🏆" }),
        );
      }
      onFinished();
    } catch {
      toast.error("Could not submit quiz, please try again");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    const percent = Math.round((result.score / result.totalQuestions) * 100);
    return (
      <div className="card space-y-5">
        <div className="text-center py-2">
          <p className="text-5xl font-bold text-primary-600 dark:text-primary-400">
            {result.score}
            <span className="text-2xl text-gray-400">
              /{result.totalQuestions}
            </span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {percent}% correct
          </p>
          {result.xp?.xpAwarded ? (
            <p className="text-xs text-primary-600 dark:text-primary-400 mt-2 font-medium">
              +{result.xp.xpAwarded} XP earned
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          {result.breakdown.map((b, i) => (
            <div
              key={i}
              className={`text-sm p-3 rounded-lg border ${
                b.isCorrect
                  ? "bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20"
                  : "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20"
              }`}
            >
              <p className="font-medium text-gray-900 dark:text-white flex items-start gap-2">
                {b.isCorrect ? (
                  <FiCheck className="text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                ) : (
                  <FiX className="text-red-500 mt-0.5 shrink-0" />
                )}
                {b.question}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1.5 ml-6">
                Your answer:{" "}
                <span className="font-medium">{b.options[b.yourAnswer]}</span>
                {!b.isCorrect && (
                  <>
                    {" "}
                    &mdash; correct:{" "}
                    <span className="font-medium text-green-700 dark:text-green-400">
                      {b.options[b.correctIndex]}
                    </span>
                  </>
                )}
              </p>
            </div>
          ))}
        </div>

        <button onClick={onExit} className="btn-secondary w-full">
          Back to quizzes
        </button>

        <CelebrationModal
          open={showCelebration}
          title={`${percent}%! Nicely done.`}
          message={`You got ${result.score} out of ${result.totalQuestions} right${result.xp?.xpAwarded ? ` — +${result.xp.xpAwarded} XP` : ""}.`}
          onClose={() => setShowCelebration(false)}
        />
      </div>
    );
  }

  return (
    <div className="card space-y-5">
      <h3 className="font-semibold text-gray-900 dark:text-white">
        {quiz.title}
      </h3>
      {quiz.questions.map((q, qi) => (
        <div key={qi}>
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {qi + 1}. {q.question}
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {q.options.map((opt, oi) => (
              <label
                key={oi}
                className={`flex items-center gap-2.5 text-sm border rounded-lg px-3 py-2.5 cursor-pointer transition-colors ${
                  answers[qi] === oi
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-gray-900 dark:text-white"
                    : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-primary-200 dark:hover:border-primary-500/30"
                }`}
              >
                <input
                  type="radio"
                  name={`q-${qi}`}
                  checked={answers[qi] === oi}
                  onChange={() => selectAnswer(qi, oi)}
                  className="w-4 h-4 accent-primary-500 shrink-0"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary"
        >
          {submitting ? "Submitting..." : "Submit quiz"}
        </button>
        <button onClick={onExit} className="btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  );
}
