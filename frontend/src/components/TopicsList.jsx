import { useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../services/api";

const STATUS_OPTIONS = ["Not Started", "In Progress", "Completed"];

const STATUS_STYLES = {
  "Not Started":
    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  "In Progress":
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Completed:
    "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
};

export default function TopicsList() {
  const [topics, setTopics] = useState([]);
  const [newTopicName, setNewTopicName] = useState("");

  async function fetchTopics() {
    const { data } = await api.get("/topics");
    setTopics(data.topics);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/topics");
        if (!cancelled) setTopics(data.topics);
      } catch {
        // ignore initial load errors
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAddTopic(e) {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    await api.post("/topics", { name: newTopicName.trim() });
    setNewTopicName("");
    fetchTopics();
  }

  async function handleUpdate(topic, changes) {
    const updated = { ...topic, ...changes };
    setTopics((prev) => prev.map((t) => (t._id === topic._id ? updated : t)));
    try {
      await api.put(`/topics/${topic._id}`, updated);
    } catch {
      toast.error("Could not save that change");
      fetchTopics();
    }
  }

  async function handleDelete(id) {
    setTopics((prev) => prev.filter((t) => t._id !== id));
    await api.delete(`/topics/${id}`);
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        Learning topics
      </h3>

      <form onSubmit={handleAddTopic} className="flex gap-2 mb-4">
        <input
          value={newTopicName}
          onChange={(e) => setNewTopicName(e.target.value)}
          placeholder="e.g. React, DSA, System Design"
          className="input-field"
        />
        <button
          type="submit"
          className="btn-primary flex items-center gap-1 whitespace-nowrap"
        >
          <FiPlus /> Add
        </button>
      </form>

      <div className="space-y-3">
        {topics.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No topics yet, add your first one above.
          </p>
        )}
        {topics.map((topic) => (
          <div
            key={topic._id}
            className="border border-gray-100 dark:border-gray-800 rounded-xl p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {topic.name}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[topic.status]}`}
                >
                  {topic.status}
                </span>
                <button
                  onClick={() => handleDelete(topic._id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <label className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                Hours
                <input
                  type="number"
                  min="0"
                  value={topic.hoursStudied}
                  onChange={(e) =>
                    handleUpdate(topic, {
                      hoursStudied: Number(e.target.value),
                    })
                  }
                  className="w-16 input-field py-1"
                />
              </label>

              <label className="flex items-center gap-1 text-gray-500 dark:text-gray-400 flex-1 min-w-[140px]">
                Progress
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={topic.completionPercentage}
                  onChange={(e) =>
                    handleUpdate(topic, {
                      completionPercentage: Number(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span className="w-9 text-right">
                  {topic.completionPercentage}%
                </span>
              </label>

              <select
                value={topic.status}
                onChange={(e) =>
                  handleUpdate(topic, { status: e.target.value })
                }
                className="input-field py-1 text-sm w-auto"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
