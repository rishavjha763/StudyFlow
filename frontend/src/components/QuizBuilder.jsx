import { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';

const emptyQuestion = () => ({ question: '', options: ['', '', '', ''], correctIndex: 0 });

// Form for creating a new quiz: a title, category, and any number of
// 4-option multiple-choice questions.
export default function QuizBuilder({ onCreated, onCancel }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [saving, setSaving] = useState(false);

  function updateQuestion(index, changes) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...changes } : q)));
  }

  function updateOption(qIndex, optIndex, value) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const options = [...q.options];
        options[optIndex] = value;
        return { ...q, options };
      })
    );
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }

  function removeQuestion(index) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Give the quiz a title');
      return;
    }
    for (const q of questions) {
      if (!q.question.trim() || q.options.some((o) => !o.trim())) {
        toast.error('Fill in every question and all 4 options');
        return;
      }
    }

    setSaving(true);
    try {
      await api.post('/quizzes', { title, category, questions });
      toast.success('Quiz created');
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create quiz');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quiz title" className="input-field" />
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (e.g. JavaScript)" className="input-field" />
      </div>

      <div className="space-y-4">
        {questions.map((q, qi) => (
          <div key={qi} className="border border-gray-100 dark:border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400">Question {qi + 1}</span>
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(qi)} className="text-gray-400 hover:text-red-500">
                  <FiTrash2 size={14} />
                </button>
              )}
            </div>
            <input
              value={q.question}
              onChange={(e) => updateQuestion(qi, { question: e.target.value })}
              placeholder="Question text"
              className="input-field mb-3"
            />
            <div className="grid sm:grid-cols-2 gap-2">
              {q.options.map((opt, oi) => (
                <label key={oi} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={q.correctIndex === oi}
                    onChange={() => updateQuestion(qi, { correctIndex: oi })}
                  />
                  <input
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={`Option ${oi + 1}`}
                    className="input-field py-1.5"
                  />
                </label>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-2">Select the radio button next to the correct answer.</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={addQuestion} className="btn-secondary text-sm flex items-center gap-1">
          <FiPlus /> Add question
        </button>
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saving ? 'Saving...' : 'Save quiz'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">Cancel</button>
      </div>
    </form>
  );
}
