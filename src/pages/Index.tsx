import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { ParticleField } from "@/components/PlayerVisuals";
import { PlayerTab } from "@/components/PlayerTab";
import { FavoritesTab, HistoryTab, SettingsTab } from "@/components/LibraryTabs";
import { MiniPlayer } from "@/components/MiniPlayer";

const TRACKS = [
  { id: 1, title: "Нейронный Дрейф", artist: "Синтез-9", duration: 247, genre: "Ambient" },
  { id: 2, title: "Квантовый Пульс", artist: "Void Collective", duration: 193, genre: "Electronic" },
  { id: 3, title: "Туманность", artist: "Echo Fields", duration: 318, genre: "Atmospheric" },
  { id: 4, title: "Гравитация", artist: "Синтез-9", duration: 274, genre: "Synth" },
  { id: 5, title: "Орбита Распада", artist: "Dark Matter", duration: 201, genre: "Industrial" },
  { id: 6, title: "Сигнал из Пустоты", artist: "Void Collective", duration: 356, genre: "Ambient" },
];

type Tab = "player" | "favorites" | "history" | "settings";

export default function Index() {
  const [tab, setTab] = useState<Tab>("player");
  const [trackIdx, setTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [favorites, setFavorites] = useState<number[]>([2, 4]);
  const [history, setHistory] = useState<{ id: number; ts: string }[]>([
    { id: 1, ts: "Сегодня, 14:32" },
    { id: 3, ts: "Сегодня, 13:10" },
    { id: 5, ts: "Вчера, 22:45" },
  ]);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [bassBoost, setBassBoost] = useState(50);
  const [spatialAudio, setSpatialAudio] = useState(false);
  const [accentColor, setAccentColor] = useState("violet");
  const [bassLevel, setBassLevel] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bassRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playChime = (type: "in" | "out") => {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    audioCtxRef.current = ctx;
    const notes = type === "in" ? [523, 659, 784] : [784, 659, 523];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  };

  useEffect(() => {
    playChime("in");
    return () => { playChime("out"); };
  }, []);

  const track = TRACKS[trackIdx];
  const covers = ["🌌", "⚡", "🌫️", "🔮", "🖤", "📡"];

  const handleNext = useCallback(() => {
    const next = shuffle
      ? Math.floor(Math.random() * TRACKS.length)
      : (trackIdx + 1) % TRACKS.length;
    setTrackIdx(next);
    setProgress(0);
    setHistory((h) => [{ id: TRACKS[next].id, ts: "Только что" }, ...h.slice(0, 19)]);
  }, [trackIdx, shuffle]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= track.duration) {
            handleNext();
            return 0;
          }
          return p + 1;
        });
      }, 1000);
      bassRef.current = setInterval(() => {
        setBassLevel(Math.random());
      }, 150);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (bassRef.current) clearInterval(bassRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (bassRef.current) clearInterval(bassRef.current);
    };
  }, [isPlaying, trackIdx, handleNext, track.duration]);

  const handlePrev = () => {
    if (progress > 5) {
      setProgress(0);
    } else {
      const prev = (trackIdx - 1 + TRACKS.length) % TRACKS.length;
      setTrackIdx(prev);
      setProgress(0);
    }
  };

  const toggleFav = (id: number) => {
    setFavorites((f) => f.includes(id) ? f.filter((x) => x !== id) : [...f, id]);
  };

  const playTrack = (idx: number) => {
    setTrackIdx(idx);
    setProgress(0);
    setIsPlaying(true);
    setHistory((h) => [{ id: TRACKS[idx].id, ts: "Только что" }, ...h.filter(x => x.id !== TRACKS[idx].id).slice(0, 19)]);
  };

  const handleTogglePlay = () => {
    if (!isPlaying) {
      setHistory((h) => [{ id: track.id, ts: "Только что" }, ...h.filter(x => x.id !== track.id).slice(0, 19)]);
    }
    setIsPlaying(!isPlaying);
  };

  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: "player", icon: "Music2", label: "Плеер" },
    { id: "favorites", icon: "Heart", label: "Любимое" },
    { id: "history", icon: "Clock", label: "История" },
    { id: "settings", icon: "SlidersHorizontal", label: "Настройки" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-8 px-4 relative z-10">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-4 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <h1 className="font-display text-lg font-bold shimmer-text tracking-tight">MONAH SCHAROV</h1>
          <span className="font-mono text-xs text-muted-foreground">v1.0</span>
        </div>

        {/* Main Card */}
        <div className="glass rounded-3xl p-6 relative overflow-hidden" style={{ backgroundImage: "url('https://cdn.poehali.dev/projects/84706224-f4f6-4a5d-8f96-bc45482b525f/files/4a24e40a-e226-4735-aaf0-bd3cb946cc5a.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
          <ParticleField isPlaying={isPlaying} />

          {/* Tabs */}
          <div className="flex gap-1 mb-6 glass rounded-2xl p-1">
            {navItems.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all duration-200 ${
                  tab === n.id
                    ? "bg-neon-violet/20 text-neon-violet"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon name={n.icon} size={16} />
                <span className="text-[9px] font-mono uppercase tracking-widest">{n.label}</span>
              </button>
            ))}
          </div>

          {tab === "player" && (
            <PlayerTab
              track={track}
              trackIdx={trackIdx}
              covers={covers}
              isPlaying={isPlaying}
              progress={progress}
              volume={volume}
              shuffle={shuffle}
              repeat={repeat}
              favorites={favorites}
              bassLevel={bassLevel}
              onToggleFav={toggleFav}
              onSetProgress={setProgress}
              onSetVolume={setVolume}
              onTogglePlay={handleTogglePlay}
              onPrev={handlePrev}
              onNext={handleNext}
              onSetShuffle={setShuffle}
              onSetRepeat={setRepeat}
            />
          )}

          {tab === "favorites" && (
            <FavoritesTab
              tracks={TRACKS}
              covers={covers}
              favorites={favorites}
              trackIdx={trackIdx}
              isPlaying={isPlaying}
              onPlay={playTrack}
              onToggleFav={toggleFav}
            />
          )}

          {tab === "history" && (
            <HistoryTab
              history={history}
              tracks={TRACKS}
              covers={covers}
              onPlay={playTrack}
              onClear={() => setHistory([])}
            />
          )}

          {tab === "settings" && (
            <SettingsTab
              tracks={TRACKS}
              trackIdx={trackIdx}
              bassBoost={bassBoost}
              spatialAudio={spatialAudio}
              accentColor={accentColor}
              onSetBassBoost={setBassBoost}
              onToggleSpatial={() => setSpatialAudio(!spatialAudio)}
              onSetAccentColor={setAccentColor}
              onPlayTrack={playTrack}
            />
          )}
        </div>

        {/* Mini player bar */}
        {tab !== "player" && (
          <MiniPlayer
            cover={covers[trackIdx]}
            title={track.title}
            isPlaying={isPlaying}
            onGoToPlayer={() => setTab("player")}
            onTogglePlay={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
          />
        )}

        <p className="text-center text-[10px] font-mono text-muted-foreground opacity-40 pb-2">
          MONAH SCHAROV PLAYER · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}