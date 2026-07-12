import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { FiX } from 'react-icons/fi';

// Full-screen congratulations moment with confetti — used whenever the user
// finishes something meaningful (weekly revision complete, level up, etc).
export default function CelebrationModal({ open, title, message, onClose }) {
  useEffect(() => {
    if (!open) return;

    const end = Date.now() + 1800;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#10b981', '#34d399', '#ffffff'] });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#10b981', '#34d399', '#ffffff'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 220 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-10 text-center max-w-sm w-full relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close">
              <FiX />
            </button>
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring' }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 font-sans">{message}</p>
            <button onClick={onClose} className="btn-primary w-full">Continue</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
