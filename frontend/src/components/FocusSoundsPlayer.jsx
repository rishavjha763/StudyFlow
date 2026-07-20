import { useEffect, useRef, useState } from "react";
import {
  FiPlay,
  FiPause,
  FiMusic,
  FiSearch,
  FiYoutube,
  FiX,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import api from "../services/api";

const SOUNDS = [
  { key: "white", label: "White noise" },
  { key: "pink", label: "Rain-like" },
  { key: "brown", label: "Deep hum" },
];

// Generates noise entirely with the Web Audio API — no external audio files needed.
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

// Loads the YouTube IFrame Player API script once (shared across mounts) and
// resolves when window.YT is ready to use. No API key needed for playback
// itself — only search (below) needs one, and that call goes through our
// backend so the key stays private.
let ytApiPromise = null;
function loadYouTubeApi() {
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = resolve;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  });
  return ytApiPromise;
}

const YT_PLAYER_CONTAINER_ID = "focus-youtube-player";

export default function FocusSoundsPlayer() {
  const [tab, setTab] = useState("ambient"); // 'ambient' | 'youtube'

  // --- Ambient noise state ---
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState("pink");
  const [volume, setVolume] = useState(0.4);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const gainRef = useRef(null);

  // --- YouTube state ---
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [currentVideo, setCurrentVideo] = useState(null);
  const [ytPlaying, setYtPlaying] = useState(false);
  const [videoHidden, setVideoHidden] = useState(false);
  const ytPlayerRef = useRef(null);

  useEffect(() => {
    return () => {
      stopAmbient();
      if (ytPlayerRef.current) ytPlayerRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Ambient noise controls ---
  function stopAmbient() {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (e) {
        /* already stopped */
      }
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
  }

  function startAmbient(type = sound) {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (
        window.AudioContext || window.webkitAudioContext
      )();
    }
    const ctx = audioCtxRef.current;
    stopAmbient();

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

  function toggleAmbient() {
    if (playing) {
      stopAmbient();
      setPlaying(false);
    } else {
      // Only one audio source at a time — stop any YouTube playback first.
      if (ytPlayerRef.current && ytPlaying) {
        ytPlayerRef.current.pauseVideo();
        setYtPlaying(false);
      }
      startAmbient();
    }
  }

  function changeSound(type) {
    setSound(type);
    if (playing) startAmbient(type);
  }

  function changeVolume(v) {
    setVolume(v);
    if (gainRef.current) gainRef.current.gain.value = v;
  }

  // --- YouTube controls ---
  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const { data } = await api.get("/youtube/search", {
        params: { q: query },
      });
      setResults(data.results);
    } catch (err) {
      setSearchError(
        err.response?.data?.message || "Could not search right now",
      );
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function playVideo(video) {
    if (playing) {
      stopAmbient();
      setPlaying(false);
    } // only one audio source at a time

    setVideoHidden(false);
    setCurrentVideo(video);
    await loadYouTubeApi();

    if (ytPlayerRef.current) {
      ytPlayerRef.current.loadVideoById(video.videoId);
      return;
    }

    ytPlayerRef.current = new window.YT.Player(YT_PLAYER_CONTAINER_ID, {
      videoId: video.videoId,
      width: "100%",
      height: "140",
      playerVars: { autoplay: 1, rel: 0 },
      events: {
        onReady: (e) => {
          e.target.playVideo();
          setYtPlaying(true);
        },
        onStateChange: (e) => {
          setYtPlaying(e.data === window.YT.PlayerState.PLAYING);
        },
      },
    });
  }

  function toggleYtPlayback() {
    if (!ytPlayerRef.current) return;
    if (ytPlaying) {
      ytPlayerRef.current.pauseVideo();
    } else {
      ytPlayerRef.current.playVideo();
    }
  }

  function stopYt() {
    if (ytPlayerRef.current) {
      ytPlayerRef.current.stopVideo();
    }
    setCurrentVideo(null);
    setYtPlaying(false);
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl p-4 w-72">
      {/* Tab switcher */}
      <div className="flex gap-1 mb-3 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setTab("ambient")}
          className={`flex-1 text-xs py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
            tab === "ambient"
              ? "bg-white dark:bg-gray-700 shadow-sm font-medium text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <FiMusic size={12} /> Ambient
        </button>
        <button
          onClick={() => setTab("youtube")}
          className={`flex-1 text-xs py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
            tab === "youtube"
              ? "bg-white dark:bg-gray-700 shadow-sm font-medium text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <FiYoutube size={12} /> YouTube
        </button>
      </div>

      {/* Ambient noise tab */}
      {tab === "ambient" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Offline, no setup needed
            </span>
            <button
              onClick={toggleAmbient}
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
      )}

      {/* YouTube tab — search + play any song */}
      {tab === "youtube" && (
        <div>
          <form onSubmit={handleSearch} className="flex gap-1.5 mb-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any song or playlist..."
              className="input-field text-xs py-1.5"
            />
            <button
              type="submit"
              disabled={searching}
              className="btn-primary px-2.5 shrink-0"
            >
              <FiSearch size={13} />
            </button>
          </form>

          {/* Video player renders here once something is playing.
              When "hidden", we don't unmount it (that would stop the audio) —
              we just collapse it to zero height so playback keeps going. */}
          <div className={currentVideo ? "mb-3" : "hidden"}>
            <div
              className={
                videoHidden
                  ? "h-0 overflow-hidden"
                  : "rounded-lg overflow-hidden bg-black"
              }
            >
              <div id={YT_PLAYER_CONTAINER_ID} />
            </div>

            {currentVideo && (
              <div
                className={`flex items-center justify-between gap-2 ${videoHidden ? "" : "mt-2"}`}
              >
                {videoHidden && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse shrink-0" />
                )}
                <p className="text-[11px] text-gray-600 dark:text-gray-300 truncate flex-1">
                  {currentVideo.title}
                </p>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setVideoHidden((h) => !h)}
                    className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center"
                    aria-label={videoHidden ? "Show video" : "Hide video"}
                    title={
                      videoHidden
                        ? "Show video"
                        : "Hide video, keep audio playing"
                    }
                  >
                    {videoHidden ? <FiEyeOff size={12} /> : <FiEye size={12} />}
                  </button>
                  <button
                    onClick={toggleYtPlayback}
                    className="w-7 h-7 rounded-full bg-primary-500 text-black flex items-center justify-center"
                    aria-label={ytPlaying ? "Pause" : "Play"}
                  >
                    {ytPlaying ? <FiPause size={12} /> : <FiPlay size={12} />}
                  </button>
                  <button
                    onClick={stopYt}
                    className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center"
                    aria-label="Stop"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5">
            {searching && (
              <p className="text-xs text-gray-400 text-center py-4">
                Searching...
              </p>
            )}
            {searchError && (
              <p className="text-xs text-red-500 text-center py-4">
                {searchError}
              </p>
            )}
            {!searching && !searchError && results.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4 font-sans">
                Search for any song to play while you study.
              </p>
            )}
            {results.map((r) => (
              <button
                key={r.videoId}
                onClick={() => playVideo(r)}
                className="w-full flex items-center gap-2 text-left p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <img
                  src={r.thumbnail}
                  alt=""
                  className="w-12 h-8 rounded object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-gray-800 dark:text-gray-100 truncate">
                    {r.title}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">
                    {r.channelTitle}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
