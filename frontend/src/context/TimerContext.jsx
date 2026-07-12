import { createContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

// eslint-disable-next-line react-refresh/only-export-components
export const TimerContext = createContext();

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function TimerProvider({ children }) {
  const [status, setStatus] = useState("idle"); // idle | running | paused
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [leveledUp, setLeveledUp] = useState(null);

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
  }

  function pause() {
    accumulatedRef.current = elapsedSeconds;
    clearInterval(intervalRef.current);
    setStatus("paused");
  }

  function resume() {
    startRef.current = Date.now();
    setStatus("running");
  }

  async function stop(onSaved) {
    clearInterval(intervalRef.current);
    const finalSeconds = elapsedSeconds;
    setStatus("idle");

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
    } catch (err) {
      console.error("Save session failed:", err);
      toast.error("Could not save that session, please try again");
      return null;
    }
  }

  function reset() {
    clearInterval(intervalRef.current);
    accumulatedRef.current = 0;
    setElapsedSeconds(0);
    setStatus("idle");
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
