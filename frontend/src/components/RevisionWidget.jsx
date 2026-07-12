import { useEffect, useState } from "react";
import { FiCheckCircle, FiCircle, FiCalendar } from "react-icons/fi";
import api from "../services/api";
import CelebrationModal from "./CelebrationModal";

// Shows the topics studied this week (auto-built by the backend every Sunday reset)
// as a checklist. Completing every item triggers a full-screen celebration.
export default function RevisionWidget() {
  const [revision, setRevision] = useState(null);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRevision() {
      const { data } = await api.get("/revisions/current");
      if (isMounted) {
        setRevision(data.revision);
      }
    }

    loadRevision();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleToggle(index) {
    const { data } = await api.put(
      `/revisions/${revision._id}/toggle/${index}`,
    );
    setRevision(data.revision);
    if (data.justCompleted) {
      setCelebrate(true);
    }
  }

  if (!revision) {
    return (
      <div className="card">
        <div className="skeleton h-5 w-40 mb-4" />
        <div className="skeleton h-9 w-full mb-2" />
        <div className="skeleton h-9 w-full" />
      </div>
    );
  }

  const total = revision.topics.length;
  const done = revision.topics.filter((t) => t.reviewed).length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FiCalendar className="text-primary-600 dark:text-primary-400" />{" "}
          Weekly revision
        </h3>
        <span className="text-xs text-gray-400">
          {done}/{total} done
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-sans">
        Topics you studied this week — review them before Sunday resets the
        list.
      </p>

      {total === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 font-sans">
          Nothing here yet — mark a topic "In Progress" or "Completed" and it'll
          show up here to revise.
        </p>
      ) : (
        <>
          <div className="space-y-2">
            {revision.topics.map((t, i) => (
              <button
                key={i}
                onClick={() => handleToggle(i)}
                className={`w-full flex items-center gap-3 text-sm px-3 py-2.5 rounded-lg border transition-all text-left ${
                  t.reviewed
                    ? "border-primary-200 dark:border-primary-500/30 bg-primary-50 dark:bg-primary-500/10 text-gray-500 dark:text-gray-400"
                    : "border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:border-primary-200 dark:hover:border-primary-500/30"
                }`}
              >
                {t.reviewed ? (
                  <FiCheckCircle className="text-primary-600 dark:text-primary-400 shrink-0" />
                ) : (
                  <FiCircle className="text-gray-300 dark:text-gray-600 shrink-0" />
                )}
                <span className={t.reviewed ? "line-through" : ""}>
                  {t.topicName}
                </span>
              </button>
            ))}
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </>
      )}

      <CelebrationModal
        open={celebrate}
        title="Revision complete!"
        message="You reviewed everything you studied this week. +10 XP"
        onClose={() => setCelebrate(false)}
      />
    </div>
  );
}
