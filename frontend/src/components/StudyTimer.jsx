import { FiPlay, FiPause, FiSquare, FiRotateCcw } from "react-icons/fi";
import { useTimer } from "../context/useTimer";
import CelebrationModal from "./CelebrationModal";

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

// This component is now just a "view" — all the actual timer state lives in
// TimerContext (mounted once in main.jsx), so it keeps running correctly no
// matter which page the user navigates to.
export default function StudyTimer({ onSessionSaved }) {
  const {
    status,
    elapsedSeconds,
    start,
    pause,
    resume,
    stop,
    reset,
    leveledUp,
    clearLevelUp,
  } = useTimer();

  async function handleStop() {
    await stop(onSessionSaved);
  }

  return (
    <div className="card flex flex-col items-center">
      <p className="text-xs tracking-widest text-gray-400 font-medium mb-1">
        FOCUS TIMER
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        Current session
      </p>
      <p className="text-5xl font-bold tabular-nums text-gray-900 dark:text-white mb-6">
        {formatTime(elapsedSeconds)}
      </p>

      <div className="flex gap-3">
        {status === "idle" && (
          <button
            onClick={start}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlay /> Start
          </button>
        )}
        {status === "running" && (
          <button
            onClick={pause}
            className="btn-secondary flex items-center gap-2"
          >
            <FiPause /> Pause
          </button>
        )}
        {status === "paused" && (
          <button
            onClick={resume}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlay /> Resume
          </button>
        )}
        {status !== "idle" && (
          <button
            onClick={handleStop}
            className="btn-secondary flex items-center gap-2"
          >
            <FiSquare /> Stop
          </button>
        )}
        {status === "idle" && elapsedSeconds > 0 && (
          <button
            onClick={reset}
            className="btn-secondary flex items-center gap-2"
          >
            <FiRotateCcw /> Reset
          </button>
        )}
      </div>

      <CelebrationModal
        open={!!leveledUp}
        title={`Level up! You're level ${leveledUp}`}
        message="Consistent studying is paying off. Keep the streak going."
        onClose={clearLevelUp}
      />
    </div>
  );
}
