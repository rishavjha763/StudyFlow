import { useEffect, useRef, useState } from "react";
import { FiPlay, FiPause, FiSquare, FiRotateCcw } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../services/api";

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

// Study timer with start/pause/resume/stop/reset.
// Uses Date.now() timestamps (not just setInterval counting) so the time stays
// accurate even if the browser tab is backgrounded and throttles the interval.
export default function StudyTimer({ onSessionSaved }) {
  const [status, setStatus] = useState("idle"); // idle | running | paused
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startRef = useRef(null);
  const accumulatedRef = useRef(0);
  const sessionStartRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const secondsSinceStart = Math.floor((now - startRef.current) / 1000);
        setElapsedSeconds(accumulatedRef.current + secondsSinceStart);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [status]);

  function handleStart() {
    startRef.current = Date.now();
    sessionStartRef.current = new Date();
    accumulatedRef.current = 0;
    setElapsedSeconds(0);
    setStatus("running");
  }

  function handlePause() {
    accumulatedRef.current = elapsedSeconds;
    clearInterval(intervalRef.current);
    setStatus("paused");
  }

  function handleResume() {
    startRef.current = Date.now();
    setStatus("running");
  }

  async function handleStop() {
    clearInterval(intervalRef.current);
    const finalSeconds = elapsedSeconds;
    setStatus("idle");

    if (finalSeconds < 1) {
      setElapsedSeconds(0);
      return;
    }

    try {
      const { data } = await api.post("/timer/session", {
        durationInSeconds: finalSeconds,
        startedAt: sessionStartRef.current,
        endedAt: new Date(),
      });
      toast.success(
        `Saved a ${formatTime(finalSeconds)} study session (+${data.xp?.xpAwarded || 0} XP)`,
      );
      if (data.xp?.leveledUp) {
        toast(`Level up! You're now level ${data.xp.level}`, { icon: "🎉" });
      }
      setElapsedSeconds(0);
      accumulatedRef.current = 0;
      onSessionSaved && onSessionSaved();
    } catch {
      toast.error("Could not save that session, please try again");
    }
  }

  function handleReset() {
    clearInterval(intervalRef.current);
    accumulatedRef.current = 0;
    setElapsedSeconds(0);
    setStatus("idle");
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
            onClick={handleStart}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlay /> Start
          </button>
        )}
        {status === "running" && (
          <button
            onClick={handlePause}
            className="btn-secondary flex items-center gap-2"
          >
            <FiPause /> Pause
          </button>
        )}
        {status === "paused" && (
          <button
            onClick={handleResume}
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
            onClick={handleReset}
            className="btn-secondary flex items-center gap-2"
          >
            <FiRotateCcw /> Reset
          </button>
        )}
      </div>
    </div>
  );
}
