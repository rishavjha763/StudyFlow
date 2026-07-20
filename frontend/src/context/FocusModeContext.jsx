import { createContext, useState } from "react";

export const FocusModeContext = createContext();

// Global so both AppLayout (which hides the sidebar/header) and DashboardPage
// (which hides widgets) can react to the same focus-mode flag.
export function FocusModeProvider({ children }) {
  const [focusMode, setFocusMode] = useState(false);
  const [notificationsMuted, setNotificationsMuted] = useState(false);

  async function enterFocusMode() {
    setFocusMode(true);
    setNotificationsMuted(true); // distraction-free by default when entering
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Fullscreen can be blocked (e.g. inside an embedded preview) — focus
      // mode still works fine without it.
    }
  }

  async function exitFocusMode() {
    setFocusMode(false);
    setNotificationsMuted(false); // restore normal toasts outside focus mode
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        /* ignore */
      }
    }
  }

  function toggleNotifications() {
    setNotificationsMuted((m) => !m);
  }

  return (
    <FocusModeContext.Provider
      value={{
        focusMode,
        enterFocusMode,
        exitFocusMode,
        notificationsMuted,
        toggleNotifications,
      }}
    >
      {children}
    </FocusModeContext.Provider>
  );
}
