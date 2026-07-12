import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../services/api";

// Lives on the dashboard so users don't have to leave it just to jot something down.
// Full note management (edit, search, delete) stays on the dedicated Notes page.
export default function QuickNotesWidget() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function fetchLatest() {
    const { data } = await api.get("/notes");
    setNotes(data.notes.slice(0, 5));
  }

  useEffect(() => {
    // defer invoking fetchLatest so state updates happen asynchronously and avoid
    // synchronous setState inside the effect body
    Promise.resolve().then(fetchLatest);
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const { data } = await api.post("/notes", {
      title: title.trim(),
      description: "",
    });
    toast.success(`Note saved (+${data.xp?.xpAwarded || 0} XP)`);
    setTitle("");
    setShowForm(false);
    fetchLatest();
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Quick notes
        </h3>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="text-primary-600 text-sm flex items-center gap-1"
        >
          <FiPlus /> Add
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="flex gap-2 mb-3">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What did you just learn?"
            className="input-field text-sm py-2"
          />
          <button type="submit" className="btn-primary text-sm">
            Save
          </button>
        </form>
      )}

      <div className="space-y-2">
        {notes.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No notes yet.
          </p>
        )}
        {notes.map((n) => (
          <div
            key={n._id}
            className="text-sm border-b border-gray-100 dark:border-gray-800 last:border-0 pb-2"
          >
            <p className="font-medium text-gray-800 dark:text-gray-100 truncate">
              {n.title}
            </p>
          </div>
        ))}
      </div>

      <Link
        to="/notes"
        className="text-xs text-primary-600 flex items-center gap-1 mt-3"
      >
        View all notes <FiArrowRight size={12} />
      </Link>
    </div>
  );
}
