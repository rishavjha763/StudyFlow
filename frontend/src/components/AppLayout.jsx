import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiMenu,
  FiTarget,
  FiX,
  FiClock,
  FiBell,
  FiBellOff,
} from "react-icons/fi";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import FocusSoundsPlayer from "./FocusSoundsPlayer";
import { useTimer } from "../context/useTimer";
import { useFocusMode } from "../context/useFocusMode";

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

// Shared shell for every logged-in page. Focus mode itself (the boolean and
// enter/exit logic) now lives in FocusModeContext so DashboardPage can also
// react to it and hide its own widgets — this component just renders the
// chrome (sidebar/header) based on that shared state.
export default function AppLayout({ section = "Workspace", title, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { status: timerStatus, elapsedSeconds } = useTimer();
  const {
    focusMode,
    enterFocusMode,
    exitFocusMode,
    notificationsMuted,
    toggleNotifications,
  } = useFocusMode();

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {!focusMode && (
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      )}

      <div className="flex-1 min-w-0">
        <AnimatePresence>
          {!focusMode && (
            <motion.header
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-950/70 backdrop-blur sticky top-0 z-20"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="sm:hidden p-2 -ml-2 text-gray-500 dark:text-gray-300"
                  aria-label="Open menu"
                >
                  <FiMenu size={20} />
                </button>
                <div>
                  <p className="text-xs text-gray-400">{section}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {timerStatus !== "idle" && (
                  <Link
                    to="/study-timer"
                    className="hidden sm:flex items-center gap-1.5 text-xs font-mono bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 px-2.5 py-1.5 rounded-full"
                    title="Focus Timer is still running"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full bg-primary-500 ${timerStatus === "running" ? "animate-pulse" : ""}`}
                    />
                    <FiClock size={12} /> {formatTime(elapsedSeconds)}
                  </Link>
                )}
                <button
                  onClick={enterFocusMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                  aria-label="Enter focus mode"
                  title="Focus mode"
                >
                  <FiTarget size={18} />
                </button>
                <ThemeToggle />
              </div>
            </motion.header>
          )}
        </AnimatePresence>

        <motion.main
          animate={{ maxWidth: focusMode ? 640 : 1600 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`px-4 sm:px-8 py-6 sm:py-8 mx-auto ${focusMode ? "pt-16" : ""}`}
        >
          {children}
        </motion.main>
      </div>

      <AnimatePresence>
        {focusMode && (
          <>
            <motion.button
              key="exit-focus"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: "spring", damping: 18, stiffness: 260 }}
              onClick={exitFocusMode}
              className="fixed top-5 right-5 z-50 w-11 h-11 rounded-full bg-gray-900/90 dark:bg-white/90 text-white dark:text-gray-900 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              aria-label="Exit focus mode"
              title="Exit Focus Mode"
            >
              <FiX size={20} />
            </motion.button>

            <motion.button
              key="mute-notifications"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{
                type: "spring",
                damping: 18,
                stiffness: 260,
                delay: 0.05,
              }}
              onClick={toggleNotifications}
              className="fixed top-5 right-[72px] z-50 w-11 h-11 rounded-full bg-gray-900/90 dark:bg-white/90 text-white dark:text-gray-900 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              aria-label={
                notificationsMuted
                  ? "Unmute notifications"
                  : "Mute notifications"
              }
              title={
                notificationsMuted
                  ? "Notifications muted — click to unmute"
                  : "Mute notifications"
              }
            >
              {notificationsMuted ? (
                <FiBellOff size={18} />
              ) : (
                <FiBell size={18} />
              )}
            </motion.button>

            <motion.div
              key="focus-sounds"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.1, duration: 0.25 }}
              className="fixed bottom-5 right-5 z-50"
            >
              <FocusSoundsPlayer />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
