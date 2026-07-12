import { useRef, useState } from "react";
import { FiPlay, FiPause, FiMusic } from "react-icons/fi";

const SOUNDS = [
  { key: "white", label: "White noise" },
  { key: "pink", label: "Rain-like" },
  { key: "brown", label: "Deep hum" },
];

// Generates noise entirely with the Web Audio API — no external audio files needed,
// so it works fully offline and needs zero extra assets to ship.
function buildNoiseBuffer(audioCtx, type) {
  const bufferSize = 2 * audioCtx.sampleRate;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === "white") {
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  } else if (type === "pink") {
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  } else {
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
  }
  return buffer;
}

export default function FocusSoundsPlayer() {
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState("pink");
  const [volume, setVolume] = useState(0.4);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const gainRef = useRef(null);

  function stopSource() {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch {
        /* already stopped */
      }
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
  }

  function start(type = sound) {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (
        window.AudioContext || window.webkitAudioContext
      )();
    }
    const ctx = audioCtxRef.current;
    stopSource();

    const buffer = buildNoiseBuffer(ctx, type);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    if (!gainRef.current) {
      gainRef.current = ctx.createGain();
      gainRef.current.connect(ctx.destination);
    }
    gainRef.current.gain.value = volume;

    source.connect(gainRef.current);
    source.start();
    sourceRef.current = source;
    setPlaying(true);
  }

  function toggle() {
    if (playing) {
      stopSource();
      setPlaying(false);
    } else {
      start();
    }
  }

  function changeSound(type) {
    setSound(type);
    if (playing) start(type);
  }

  function changeVolume(v) {
    setVolume(v);
    if (gainRef.current) gainRef.current.gain.value = v;
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl p-4 w-64">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <FiMusic size={13} /> Focus sounds
        </span>
        <button
          onClick={toggle}
          className="w-8 h-8 rounded-full bg-primary-500 text-black flex items-center justify-center hover:bg-primary-600 transition-colors"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <FiPause size={14} /> : <FiPlay size={14} />}
        </button>
      </div>
      <div className="flex gap-1.5 mb-3">
        {SOUNDS.map((s) => (
          <button
            key={s.key}
            onClick={() => changeSound(s.key)}
            className={`flex-1 text-[11px] px-2 py-1.5 rounded-lg border transition-colors ${
              sound === s.key
                ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400"
                : "border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={volume}
        onChange={(e) => changeVolume(parseFloat(e.target.value))}
        className="w-full accent-primary-500"
        aria-label="Volume"
      />
    </div>
  );
}
