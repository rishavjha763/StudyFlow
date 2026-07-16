import { createContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

export const TimerContext = createContext();

const STORAGE_KEY = "studyflow-timer-state";

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePersisted(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage can fail in private/incognito mode with storage disabled —
    // the timer just won't survive a hard refresh in that case, which is fine.
  }
}

function clearPersisted() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

// Lives at the top of the app (see main.jsx), above the router, so navigating
// between pages never unmounts it — that alone fixes the timer "stopping"
// when switching pages inside the app. On top of that, every state change is
// also saved to localStorage and restored on load, so the timer survives an
// actual page refresh (F5) or closing and reopening the tab too, not just
// in-app navigation.
export function TimerProvider({ children }) {
  const persisted = loadPersisted();

  const [status, setStatus] = useState(persisted?.status || "idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    if (!persisted) return 0;
    if (persisted.status === "running") {
      const secondsSinceStart = Math.floor(
        (Date.now() - persisted.startTimestamp) / 1000,
      );
      return (
        (persisted.accumulatedSeconds || 0) + Math.max(0, secondsSinceStart)
      );
    }
    return persisted.accumulatedSeconds || 0;
  });
  const [leveledUp, setLeveledUp] = useState(null);

  const startRef = useRef(
    persisted?.status === "running" ? persisted.startTimestamp : null,
  );
  const accumulatedRef = useRef(persisted?.accumulatedSeconds || 0);
  const sessionStartRef = useRef(
    persisted?.sessionStartedAt ? new Date(persisted.sessionStartedAt) : null,
  );
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

  // Recompute immediately when the tab becomes visible again, since
  // setInterval gets throttled in background tabs and would otherwise make
  // the display look "stuck" for a few seconds after switching back.
  useEffect(() => {
    function handleVisibilityChange() {
      if (
        document.visibilityState === "visible" &&
        status === "running" &&
        startRef.current
      ) {
        const now = Date.now();
        const secondsSinceStart = Math.floor((now - startRef.current) / 1000);
        setElapsedSeconds(accumulatedRef.current + secondsSinceStart);
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [status]);

  function start() {
    startRef.current = Date.now();
    sessionStartRef.current = new Date();
    accumulatedRef.current = 0;
    setElapsedSeconds(0);
    setStatus("running");
    savePersisted({
      status: "running",
      startTimestamp: startRef.current,
      accumulatedSeconds: 0,
      sessionStartedAt: sessionStartRef.current.toISOString(),
    });
  }

  function pause() {
    accumulatedRef.current = elapsedSeconds;
    clearInterval(intervalRef.current);
    setStatus("paused");
    savePersisted({
      status: "paused",
      startTimestamp: null,
      accumulatedSeconds: accumulatedRef.current,
      sessionStartedAt: sessionStartRef.current?.toISOString(),
    });
  }

  function resume() {
    startRef.current = Date.now();
    setStatus("running");
    savePersisted({
      status: "running",
      startTimestamp: startRef.current,
      accumulatedSeconds: accumulatedRef.current,
      sessionStartedAt: sessionStartRef.current?.toISOString(),
    });
  }

  async function stop(onSaved) {
    clearInterval(intervalRef.current);
    const finalSeconds = elapsedSeconds;
    setStatus("idle");
    clearPersisted();

    if (finalSeconds < 1) {
      setElapsedSeconds(0);
      return null;
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
      if (data.xp?.leveledUp) setLeveledUp(data.xp.level);
      setElapsedSeconds(0);
      accumulatedRef.current = 0;
      onSaved && onSaved();
      return data;
    } catch {
      toast.error("Could not save that session, please try again");
      return null;
    }
  }

  function reset() {
    clearInterval(intervalRef.current);
    accumulatedRef.current = 0;
    setElapsedSeconds(0);
    setStatus("idle");
    clearPersisted();
  }

  function clearLevelUp() {
    setLeveledUp(null);
  }

  return (
    <TimerContext.Provider
      value={{
        status,
        elapsedSeconds,
        start,
        pause,
        resume,
        stop,
        reset,
        leveledUp,
        clearLevelUp,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}
