import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGraduationCap } from "react-icons/fa";
import { FiClock, FiZap, FiBookOpen, FiCheckCircle } from "react-icons/fi";
import { GiFlame } from "react-icons/gi";

// Decorative heatmap grid for the hero preview card, generated once (not random per
// render) so it stays stable and forms a calm wave-like shape, similar to a GitHub
// contribution graph. Uses a CSS grid with fractional columns (not fixed pixels) so
// it scales to fill the full width of its card on any screen size.
const HEATMAP_COLS = 36;
const HEATMAP_ROWS = 7;
const HEATMAP_DATA = Array.from({ length: HEATMAP_COLS }, (_, col) => {
  const center =
    3 + 2.3 * Math.sin(col / 6) + (((col * 37) % 10) / 10 - 0.5) * 0.6;
  return Array.from({ length: HEATMAP_ROWS }, (_, row) => {
    const distance = Math.abs(row - center);
    return Math.max(0, 1 - distance / 2.1);
  });
});

const features = [
  {
    icon: <FiClock />,
    title: "Focus Timer",
    desc: "Start, pause, resume — sessions save automatically and survive refresh.",
    comingSoon: false,
  },
  {
    icon: <GiFlame />,
    title: "Streaks & commits",
    desc: "Log a study commit every day. Two freeze days a month protect your streak.",
    comingSoon: false,
  },
  {
    icon: <FiBookOpen />,
    title: "Smart revisions",
    desc: "Automatic spaced-repetition reminders at 1, 3, 7, 15, and 30 days.",
    comingSoon: true,
  },
  {
    icon: <FiZap />,
    title: "XP & achievements",
    desc: "Every session, note, and quiz earns XP. Unlock milestones as you grow.",
    comingSoon: false,
  },
];

const stats = [
  { value: "12,480+", label: "Study sessions logged" },
  { value: "94%", label: "Weekly return rate" },
  { value: "47 days", label: "Average top streak" },
  { value: "8h 12m", label: "Longest single session" },
];

const testimonials = [
  {
    quote:
      "The heatmap alone changed my study habits. I stopped skipping days.",
    name: "Priya S.",
    role: "CS Undergrad",
  },
  {
    quote: "Timer + smart revisions is exactly what I wish Notion had built.",
    name: "Marcus L.",
    role: "Bootcamp grad",
  },
  {
    quote: "Feels like a game. I'm at a 47-day streak and hooked.",
    name: "Aisha K.",
    role: "Med student",
  },
];

const faqs = [
  {
    q: "Is StudyFlow free to use?",
    a: "Yes — creating an account and using the dashboard, timer, notes, and streak tracking is free.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Every account has its own private data; nobody else can see your sessions or notes.",
  },
  {
    q: "Do I need to install anything?",
    a: "No, StudyFlow runs in your browser. Just create an account and open the dashboard.",
  },
  {
    q: "Can I export my data?",
    a: "Yes, your full study history can be exported as a CSV file at any time from the dashboard.",
  },
];

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="font-medium text-white text-sm">{item.q}</span>
        <span
          className={`text-primary-400 transition-transform ${open ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>
      {open && (
        <p className="text-sm text-gray-400 mt-2 pr-6 font-sans">{item.a}</p>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050807] text-white">
      {/* ===== Nav ===== */}
      <header className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="font-semibold flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary-500/15 text-primary-400 flex items-center justify-center">
            <FaGraduationCap size={15} />
          </span>
          StudyFlow
        </span>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-400">
          <a href="#features">Features</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-300">
            Log in
          </Link>
          <Link
            to="/register"
            className="bg-primary-500 hover:bg-primary-600 text-black font-medium text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <main className="max-w-5xl mx-auto px-6 pt-16 pb-28 text-center relative">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(16,185,129,0.16), transparent 70%)",
          }}
        />

        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative inline-flex items-center gap-2 text-xs text-primary-400 bg-primary-500/10 border border-primary-500/20 px-3 py-1.5 rounded-full"
        >
          <FiZap size={12} /> Dashboard-first study workspace
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="relative text-4xl sm:text-6xl font-bold tracking-tight mt-6 leading-[1.1]"
        >
          The study tracker that
          <br />
          <span className="text-primary-400">
            actually keeps you consistent.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative text-gray-400 mt-5 max-w-xl mx-auto font-sans"
        >
          Time your sessions, log commits, revise on schedule, and watch your
          streak grow. Everything you need &mdash; on one beautiful dashboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="relative flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
        >
          <Link
            to="/register"
            className="bg-primary-500 hover:bg-primary-600 text-black font-medium px-5 py-2.5 rounded-lg text-sm w-full sm:w-auto"
          >
            Start studying free
          </Link>
          <Link
            to="/login"
            className="bg-white/5 hover:bg-white/10 border border-white/10 font-medium px-5 py-2.5 rounded-lg text-sm w-full sm:w-auto"
          >
            I already have an account
          </Link>
        </motion.div>
        <p className="relative text-xs text-gray-500 mt-3 font-sans">
          No credit card. No install. 30 seconds to set up.
        </p>

        {/* ===== Dashboard preview card — timer + heatmap full width, stats below ===== */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="relative mt-14 space-y-4 text-left"
        >
          <div className="w-full bg-[#0b0f0e] border border-white/10 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs tracking-widest text-gray-500">
                FOCUS TIMER
              </span>
              <span className="text-xs text-primary-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />{" "}
                Session live
              </span>
            </div>
            <p className="font-mono text-4xl sm:text-5xl font-bold tracking-tight">
              01:24:37
            </p>
            <div className="flex gap-2 mt-4 mb-6">
              <span className="text-xs bg-white/10 px-3 py-1.5 rounded-lg">
                Pause
              </span>
              <span className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-gray-400">
                Stop
              </span>
            </div>

            {/* Full-width, responsive heatmap: CSS grid with fractional columns instead
                of fixed pixel cells, so it stretches to the card's full width on any screen. */}
            <div
              className="grid gap-[3px] w-full"
              style={{
                gridTemplateColumns: `repeat(${HEATMAP_COLS}, minmax(0, 1fr))`,
              }}
            >
              {HEATMAP_DATA.map((col, ci) => (
                <div
                  key={ci}
                  className="grid gap-[3px]"
                  style={{ gridTemplateRows: `repeat(${HEATMAP_ROWS}, 1fr)` }}
                >
                  {col.map((intensity, ri) => (
                    <div
                      key={ri}
                      className="w-full aspect-square rounded-[2px]"
                      style={{
                        background:
                          intensity > 0.05
                            ? `rgba(16,185,129,${0.15 + intensity * 0.85})`
                            : "rgba(255,255,255,0.05)",
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0b0f0e] border border-white/10 rounded-2xl p-5">
              <p className="text-xs text-gray-500 mb-1">Today</p>
              <p className="text-2xl font-bold">3h 42m</p>
              <p className="text-xs text-primary-400 mt-1">+18% vs yesterday</p>
            </div>
            <div className="bg-[#0b0f0e] border border-white/10 rounded-2xl p-5">
              <p className="text-xs text-gray-500 mb-1">Streak</p>
              <p className="text-2xl font-bold">
                47{" "}
                <span className="text-sm font-normal text-gray-500">days</span>
              </p>
            </div>
            <div className="bg-[#0b0f0e] border border-white/10 rounded-2xl p-5">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Level 12</span>
                <span>2,340 / 3,000 XP</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: "78%" }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ===== Features ===== */}
        <section id="features" className="mt-28 text-left">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Everything on one screen.</h2>
            <p className="text-gray-400 mt-2 font-sans">
              No tab-hopping. Your timer, notes, revisions, and stats live
              together on the dashboard.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                className={`bg-[#0b0f0e] border border-white/10 rounded-2xl p-5 ${f.comingSoon ? "opacity-50" : ""}`}
              >
                <div className="w-9 h-9 rounded-lg bg-primary-500/10 text-primary-400 flex items-center justify-center mb-3">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                  {f.title}
                  {f.comingSoon && (
                    <span className="text-[10px] bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-400 font-sans">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== Stats row ===== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-24">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-primary-400">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1 font-sans">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ===== Testimonials ===== */}
        <section className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-10">
            Learners are shipping streaks.
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
                className="bg-[#0b0f0e] border border-white/10 rounded-2xl p-5"
              >
                <p className="text-sm text-gray-300 mb-4 font-sans">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 text-xs font-semibold flex items-center justify-center">
                    {t.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-gray-500 font-sans">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="mt-24 max-w-xl mx-auto text-left">
          <h2 className="text-3xl font-bold text-center mb-10">
            Frequently asked
          </h2>
          <div className="bg-[#0b0f0e] border border-white/10 rounded-2xl px-5">
            {faqs.map((item) => (
              <FaqItem key={item.q} item={item} />
            ))}
          </div>
        </section>

        {/* ===== CTA ===== */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-24 bg-primary-500/10 border border-primary-500/20 rounded-2xl px-8 py-14 text-center"
        >
          <h2 className="text-3xl font-bold">
            Your next 100 hours starts today.
          </h2>
          <p className="text-gray-400 mt-2 font-sans">
            Create your account and open the dashboard in under a minute.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 mt-6 bg-primary-500 hover:bg-primary-600 text-black font-medium px-6 py-3 rounded-lg text-sm"
          >
            <FiCheckCircle /> Create free account
          </Link>
        </motion.div>
      </main>

      {/* ===== Footer ===== */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500 font-sans">
          <span>
            &copy; {new Date().getFullYear()} StudyFlow. Built for learners.
          </span>
          <div className="flex gap-5">
            <a href="#features">Features</a>
            <Link to="/login">Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
