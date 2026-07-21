import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiX, FiSend, FiCheckCircle, FiCode, FiAlertTriangle, FiLink, FiLoader, FiZap
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../services/api';
import { Section, BulletList, McqItem } from './RevisionTopicCard';

// Full-screen "ask AI anything you studied" modal. Answers using the user's
// own notes as context, and shows the same depth of teaching content as a
// Revision Hub topic — direct answer, detailed + simple explanation, a real
// example, common mistakes, related topics, and practice MCQs.
export default function DoubtSolverModal({ open, onClose }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [lang, setLang] = useState('en');
  const [asking, setAsking] = useState(false);

  async function handleAsk(e) {
    e.preventDefault();
    if (!question.trim()) {
      toast.error('Type a question first');
      return;
    }
    setAsking(true);
    setAnswer(null);
    try {
      const { data } = await api.post('/doubts/ask', { question: question.trim() });
      setAnswer(data.answer);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not get an answer, please try again');
    } finally {
      setAsking(false);
    }
  }

  function handleClose() {
    setQuestion('');
    setAnswer(null);
    setLang('en');
    onClose();
  }

  function askAnother() {
    setQuestion('');
    setAnswer(null);
  }

  const content = answer ? (answer[lang] || answer.en) : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiZap className="text-primary-600 dark:text-primary-400" /> Ask AI
              </h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                <FiX size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {!answer && !asking && (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-sans">
                    Ask anything about what you're studying — I'll use your notes as context and explain it properly, not just a one-liner.
                  </p>
                  <form onSubmit={handleAsk} className="space-y-3">
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      rows={4}
                      placeholder="e.g. Why does useEffect run twice in development?"
                      className="input-field resize-none"
                      autoFocus
                    />
                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                      <FiSend size={14} /> Ask
                    </button>
                  </form>
                </>
              )}

              {asking && (
                <div className="text-center py-12">
                  <FiLoader className="mx-auto mb-3 text-primary-600 dark:text-primary-400 animate-spin" size={26} />
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-sans">Thinking this through properly...</p>
                </div>
              )}

              {content && !asking && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">"{question}"</p>
                    <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 shrink-0 ml-2">
                      <button
                        onClick={() => setLang('en')}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium ${lang === 'en' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => setLang('hi')}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium ${lang === 'hi' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}
                      >
                        हि
                      </button>
                    </div>
                  </div>

                  <div className="bg-primary-50 dark:bg-primary-500/10 rounded-xl p-3 mb-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white font-sans">{content.directAnswer}</p>
                  </div>

                  <Section icon={<FiCheckCircle size={13} />} title="Detailed explanation">
                    <p className="text-sm text-gray-700 dark:text-gray-200 font-sans">{content.detailedExplanation}</p>
                  </Section>

                  <Section icon={<FiCheckCircle size={13} />} title="Simple explanation">
                    <p className="text-sm text-gray-700 dark:text-gray-200 font-sans">{content.simpleExplanation}</p>
                  </Section>

                  <Section icon={<FiZap size={13} />} title="Real-life example">
                    <p className="text-sm text-gray-700 dark:text-gray-200 font-sans">{content.realLifeExample}</p>
                  </Section>

                  {content.codeExample && (
                    <Section icon={<FiCode size={13} />} title="Code example">
                      <pre className="text-xs bg-gray-900 dark:bg-black text-gray-100 rounded-lg p-3 overflow-x-auto font-mono">
                        {content.codeExample}
                      </pre>
                    </Section>
                  )}

                  <Section icon={<FiAlertTriangle size={13} />} title="Common mistakes">
                    {content.commonMistakes?.length > 0 && <BulletList items={content.commonMistakes} />}
                  </Section>

                  <Section icon={<FiLink size={13} />} title="Related topics">
                    {content.relatedTopics?.length > 0 && <BulletList items={content.relatedTopics} />}
                  </Section>

                  {content.mcqs?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Practice questions</p>
                      <div className="space-y-2">
                        {content.mcqs.map((mcq, i) => <McqItem key={i} mcq={mcq} index={i} />)}
                      </div>
                    </div>
                  )}

                  <button onClick={askAnother} className="btn-secondary w-full mt-5">Ask another question</button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
