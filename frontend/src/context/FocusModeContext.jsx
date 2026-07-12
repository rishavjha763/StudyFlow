import { createContext, useState } from "react";
/* eslint-disable react-refresh/only-export-components */
export const FocusModeContext = createContext();

export function FocusModeProvider({ children }) {
  const [focusMode, setFocusMode] = useState(false);

  async function enterFocusMode() {
    setFocusMode(true);

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Ignore fullscreen errors
    }
  }

  async function exitFocusMode() {
    setFocusMode(false);

    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // Ignore exit fullscreen errors
      }
    }
  }

  return (
    <FocusModeContext.Provider
      value={{ focusMode, enterFocusMode, exitFocusMode }}
    >
      {children}
    </FocusModeContext.Provider>
  );
}
