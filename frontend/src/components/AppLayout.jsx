import { useState } from "react";
import { FiMenu } from "react-icons/fi";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";

// Shared shell for every logged-in page: sidebar on the left (off-canvas on mobile,
// always visible from the `sm` breakpoint up), a header with a breadcrumb and
// theme toggle, and the page content below it.
export default function AppLayout({ section = "Workspace", title, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 min-w-0">
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-950/70 backdrop-blur sticky top-0 z-20">
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
          <ThemeToggle />
        </header>
        <main className="px-4 sm:px-8 py-6 sm:py-8 max-w-[1600px]">
          {children}
        </main>
      </div>
    </div>
  );
}
