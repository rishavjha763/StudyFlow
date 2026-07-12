import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

// Shows one quiz's questions with radio options, submits all answers at once,
// then displays the score and which answers were right/wrong.
export default function QuizPlayer({ quiz, onFinished, onExit }) {
  const [answers, setAnswers] = useState(
    Array(quiz.questions.length).fill(null),
  );
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
      toast.success(
        `Scored ${data.score}/${data.totalQuestions} (+${data.xp?.xpAwarded || 0} XP)`,
      );
      if (data.newAchievements?.length > 0) {
        data.newAchievements.forEach((a) =>
          toast(`Achievement unlocked: ${a.title}`, { icon: "🏆" }),
        );
      }
      onFinished();
    } catch (err) {
      console.error(err);
      toast.error("Could not submit quiz");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="card space-y-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {result.score} / {result.totalQuestions}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round((result.score / result.totalQuestions) * 100)}% correct
          </p>
        </div>
        <div className="space-y-3">
          {result.breakdown.map((b, i) => (
            <div
              key={i}
              className={`text-sm p-3 rounded-lg ${b.isCorrect ? "bg-green-50 dark:bg-green-500/10" : "bg-red-50 dark:bg-red-500/10"}`}
            >
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {b.question}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your answer: {b.options[b.yourAnswer]}{" "}
                {b.isCorrect ? "✓" : `— correct: ${b.options[b.correctIndex]}`}
              </p>
            </div>
          ))}
        </div>
        <button onClick={onExit} className="btn-secondary w-full">
          Back to quizzes
        </button>
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
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-2">
            {qi + 1}. {q.question}
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {q.options.map((opt, oi) => (
              <label
                key={oi}
                className={`flex items-center gap-2 text-sm border rounded-lg px-3 py-2 cursor-pointer ${
                  answers[qi] === oi
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <input
                  type="radio"
                  name={`q-${qi}`}
                  checked={answers[qi] === oi}
                  onChange={() => selectAnswer(qi, oi)}
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
