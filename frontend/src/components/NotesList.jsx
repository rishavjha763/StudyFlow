import { useEffect, useState } from "react";
import {
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiSearch,
  FiSave,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../services/api";

export default function NotesList() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ title: "", description: "" });

  async function fetchNotes(searchTerm = "") {
    const { data } = await api.get("/notes", {
      params: searchTerm ? { search: searchTerm } : {},
    });
    setNotes(data.notes);
  }

  useEffect(() => {
    const loadNotes = async () => {
      const { data } = await api.get("/notes");
      setNotes(data.notes);
    };
    loadNotes();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchNotes(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newNote.title.trim()) {
      toast.error("Give the note a title first");
      return;
    }
    await api.post("/notes", newNote);
    setNewNote({ title: "", description: "" });
    setShowNewForm(false);
    fetchNotes(search);
    toast.success("Note created");
  }

  function startEdit(note) {
    setEditingId(note._id);
    setEditValues({ title: note.title, description: note.description });
  }

  async function saveEdit(id) {
    await api.put(`/notes/${id}`, editValues);
    setEditingId(null);
    fetchNotes(search);
  }

  async function handleDelete(id) {
    await api.delete(`/notes/${id}`);
    fetchNotes(search);
    toast.success("Note deleted");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="input-field pl-9"
          />
        </div>
        <button
          onClick={() => setShowNewForm((s) => !s)}
          className="btn-primary flex items-center gap-2 self-start"
        >
          <FiPlus /> New note
        </button>
      </div>

      {showNewForm && (
        <form onSubmit={handleCreate} className="card space-y-3">
          <input
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            placeholder="Note title"
            className="input-field"
          />
          <textarea
            value={newNote.description}
            onChange={(e) =>
              setNewNote({ ...newNote, description: e.target.value })
            }
            placeholder="Write what you studied..."
            rows={4}
            className="input-field"
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              Save note
            </button>
            <button
              type="button"
              onClick={() => setShowNewForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {notes.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 col-span-2">
            No notes found.
          </p>
        )}
        {notes.map((note) => (
          <div key={note._id} className="card">
            {editingId === note._id ? (
              <div className="space-y-2">
                <input
                  value={editValues.title}
                  onChange={(e) =>
                    setEditValues({ ...editValues, title: e.target.value })
                  }
                  className="input-field"
                />
                <textarea
                  value={editValues.description}
                  onChange={(e) =>
                    setEditValues({
                      ...editValues,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="input-field"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(note._id)}
                    className="btn-primary text-sm flex items-center gap-1"
                  >
                    <FiSave size={14} /> Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="btn-secondary text-sm flex items-center gap-1"
                  >
                    <FiX size={14} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {note.title}
                  </h4>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(note)}
                      className="text-gray-400 hover:text-primary-600"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {note.description}
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  Updated {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
