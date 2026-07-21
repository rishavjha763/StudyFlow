import { useState } from 'react';
import {
  FiChevronDown, FiCheckCircle, FiAlertTriangle, FiBriefcase, FiZap, FiCode, FiEye
} from 'react-icons/fi';

export function Section({ icon, title, children }) {
  if (!children || (Array.isArray(children) && children.length === 0)) return null;
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1.5">
        {icon} {title}
      </p>
      {children}
    </div>
  );
}

export function BulletList({ items }) {
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-gray-700 dark:text-gray-200 font-sans flex gap-2">
          <span className="text-primary-500 mt-1">&bull;</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function McqItem({ mcq, index }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-3">
      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{index + 1}. {mcq.question}</p>
      <div className="grid sm:grid-cols-2 gap-1.5 mb-2">
        {mcq.options.map((opt, oi) => (
          <div
            key={oi}
            className={`text-xs px-2.5 py-1.5 rounded-lg border ${
              revealed && oi === mcq.correctIndex
                ? 'border-primary-400 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 font-medium'
                : 'border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            {opt}
          </div>
        ))}
      </div>
      {revealed ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 font-sans">{mcq.explanation}</p>
      ) : (
        <button onClick={() => setRevealed(true)} className="text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1">
          <FiEye size={12} /> Reveal answer
        </button>
      )}
    </div>
  );
}

// One topic's full bilingual revision sheet, shown as an expandable card.
// `lang` ('en' | 'hi') is controlled by the page above so every card
// switches language together, instantly.
export default function RevisionTopicCard({ topic, lang, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const content = topic[lang] || topic.en;

  if (!content) return null;

  return (
    <div className="card">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between text-left">
        <h3 className="font-semibold text-gray-900 dark:text-white">{topic.topicName}</h3>
        <FiChevronDown className={`text-gray-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Section icon={<FiZap size={13} />} title="Key points">
            {content.keyPoints?.length > 0 && <BulletList items={content.keyPoints} />}
          </Section>

          <Section icon={<FiCheckCircle size={13} />} title="Simple explanation">
            {content.simpleExplanation && (
              <p className="text-sm text-gray-700 dark:text-gray-200 font-sans">{content.simpleExplanation}</p>
            )}
          </Section>

          <Section icon={<FiCheckCircle size={13} />} title="Detailed explanation">
            {content.detailedExplanation && (
              <p className="text-sm text-gray-700 dark:text-gray-200 font-sans">{content.detailedExplanation}</p>
            )}
          </Section>

          <Section icon={<FiZap size={13} />} title="Real-life example">
            {content.realLifeExample && (
              <p className="text-sm text-gray-700 dark:text-gray-200 font-sans">{content.realLifeExample}</p>
            )}
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

          <Section icon={<FiBriefcase size={13} />} title="Interview insights">
            {content.interviewInsights?.length > 0 && <BulletList items={content.interviewInsights} />}
          </Section>

          <Section icon={<FiZap size={13} />} title="Memory tricks">
            {content.memoryTricks?.length > 0 && <BulletList items={content.memoryTricks} />}
          </Section>

          {content.mcqs?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Practice questions</p>
              <div className="space-y-2">
                {content.mcqs.map((mcq, i) => <McqItem key={i} mcq={mcq} index={i} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
