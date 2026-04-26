import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const TRACKS = [
  { id: 1, title: "Нейронный Дрейф", artist: "Синтез-9", duration: 247, genre: "Ambient" },
  { id: 2, title: "Квантовый Пульс", artist: "Void Collective", duration: 193, genre: "Electronic" },
  { id: 3, title: "Туманность", artist: "Echo Fields", duration: 318, genre: "Atmospheric" },
  { id: 4, title: "Гравитация", artist: "Синтез-9", duration: 274, genre: "Synth" },
  { id: 5, title: "Орбита Распада", artist: "Dark Matter", duration: 201, genre: "Industrial" },
  { id: 6, title: "Сигнал из Пустоты", artist: "Void Collective", duration: 356, genre: "Ambient" },
];

type Tab = "player" | "favorites" | "history" | "settings";

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function Visualizer({ isPlaying, bassLevel }: { isPlaying: boolean; bassLevel: number }) {
  const bars = 48;
  return (
    <div className="flex items-end justify-center gap-[2px] h-16 w-full">
      {Array.from({ length: bars }).map((_, i) => {
        const delay = (i / bars) * 1.5;
        return (
          <div
            key={i}
            className="rounded-full transition-all duration-100 ease-out"
            style={{
              width: "3px",
              minHeight: "3px",
              background: i % 3 === 0
                ? "var(--neon-violet)"
                : i % 3 === 1
                ? "var(--neon-cyan)"
                : "var(--neon-pink)",
              opacity: isPlaying ? 0.7 + Math.sin(i * 0.5) * 0.3 : 0.25,
              animationName: isPlaying ? "waveform-bar" : "none",
              animationDuration: `${0.4 + Math.sin(i * 0.7) * 0.3}s`,
              animationDelay: `${delay}s`,
              animationIterationCount: "infinite",
              animationTimingFunction: "ease-in-out",
              height: isPlaying ? `${20 + Math.sin(i * 0.4 + bassLevel * 6) * 35 + bassLevel * 25}%` : "8%",
              transformOrigin: "bottom",
            }}
          />
        );
      })}
    </div>
  );
}

function OrbitDisc({ isPlaying, cover }: { isPlaying: boolean; cover: string }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 192, height: 192 }}>
      <div
        className={`absolute inset-0 rounded-full orbit-gradient opacity-20 ${isPlaying ? "animate-orbit-spin" : ""}`}
        style={{ filter: "blur(16px)", transform: "scale(1.3)" }}
      />
      <div
        className={`absolute rounded-full border border-neon-violet/20 ${isPlaying ? "animate-pulse-ring" : "opacity-30"}`}
        style={{ width: "110%", height: "110%" }}
      />
      <div
        className={`absolute rounded-full border border-neon-cyan/10 ${isPlaying ? "animate-pulse-ring" : "opacity-20"}`}
        style={{ width: "125%", height: "125%", animationDelay: "0.5s" }}
      />
      <div
        className={`relative rounded-full overflow-hidden glass ${isPlaying ? "animate-orbit-spin" : ""}`}
        style={{ width: 192, height: 192, animationDuration: "12s" }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center text-7xl"
          style={{ background: "radial-gradient(circle at 40% 35%, #1a0a2e, #0a0a1a)" }}
        >
          {cover}
        </div>
        <div className="absolute inset-0 rounded-full" style={{
          background: "radial-gradient(circle at 30% 25%, rgba(168,85,247,0.2), transparent 60%)",
        }} />
      </div>
      <div className="absolute w-6 h-6 rounded-full bg-background border-2 border-neon-violet/40 z-10 shadow-lg" />
    </div>
  );
}

function ParticleField({ isPlaying }: { isPlaying: boolean }) {
  if (!isPlaying) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            left: `${8 + i * 7}%`,
            bottom: "8%",
            background: i % 2 === 0 ? "var(--neon-violet)" : "var(--neon-cyan)",
            animation: `float-particle ${2 + (i % 4) * 0.7}s ease-out infinite`,
            animationDelay: `${(i * 0.3) % 2}s`,
          }}
        />
      ))}
    </div>
  );
}

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

  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: "player", icon: "Music2", label: "Плеер" },
    { id: "favorites", icon: "Heart", label: "Любимое" },
    { id: "history", icon: "Clock", label: "История" },
    { id: "settings", icon: "SlidersHorizontal", label: "Настройки" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start py-8 px-4 relative z-10">
      <div className="w-full max-w-sm mx-auto flex flex-col gap-4 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <h1 className="font-display text-lg font-bold shimmer-text tracking-tight">MONARCH</h1>
          <span className="font-mono text-xs text-muted-foreground">v1.0</span>
        </div>

        {/* Main Card */}
        <div className="glass rounded-3xl p-6 relative overflow-hidden">
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

          {/* PLAYER TAB */}
          {tab === "player" && (
            <div className="flex flex-col items-center gap-6 animate-scale-in">
              <OrbitDisc isPlaying={isPlaying} cover={covers[trackIdx]} />

              <div className="text-center w-full">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h2 className="font-display text-base font-semibold tracking-tight leading-tight">{track.title}</h2>
                  <button onClick={() => toggleFav(track.id)}>
                    <Icon
                      name="Heart"
                      size={16}
                      className={favorites.includes(track.id) ? "text-neon-pink fill-neon-pink" : "text-muted-foreground"}
                    />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{track.artist}</p>
                <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full border border-neon-violet/30 text-neon-violet/70 font-mono uppercase tracking-wider">
                  {track.genre}
                </span>
              </div>

              <div className="w-full">
                <Visualizer isPlaying={isPlaying} bassLevel={bassLevel} />
              </div>

              {/* Progress */}
              <div className="w-full flex flex-col gap-2">
                <div
                  className="relative w-full h-1 bg-secondary rounded-full cursor-pointer group"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = (e.clientX - rect.left) / rect.width;
                    setProgress(Math.round(ratio * track.duration));
                  }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(progress / track.duration) * 100}%`,
                      background: "linear-gradient(90deg, var(--neon-violet), var(--neon-cyan))",
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(track.duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShuffle(!shuffle)}
                  className={`p-2 rounded-full transition-all ${shuffle ? "text-neon-cyan" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon name="Shuffle" size={16} />
                </button>
                <button onClick={handlePrev} className="p-3 glass rounded-full hover:bg-white/10 transition-all text-foreground">
                  <Icon name="SkipBack" size={20} />
                </button>
                <button
                  onClick={() => {
                    if (!isPlaying) {
                      setHistory((h) => [{ id: track.id, ts: "Только что" }, ...h.filter(x => x.id !== track.id).slice(0, 19)]);
                    }
                    setIsPlaying(!isPlaying);
                  }}
                  className="w-16 h-16 rounded-full flex items-center justify-center transition-all glow-violet text-background font-bold"
                  style={{
                    background: "linear-gradient(135deg, var(--neon-violet), var(--neon-cyan))",
                  }}
                >
                  <Icon name={isPlaying ? "Pause" : "Play"} size={26} />
                </button>
                <button onClick={handleNext} className="p-3 glass rounded-full hover:bg-white/10 transition-all text-foreground">
                  <Icon name="SkipForward" size={20} />
                </button>
                <button
                  onClick={() => setRepeat(!repeat)}
                  className={`p-2 rounded-full transition-all ${repeat ? "text-neon-violet" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon name="Repeat" size={16} />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3 w-full">
                <Icon name="Volume1" size={14} className="text-muted-foreground flex-shrink-0" />
                <div
                  className="relative flex-1 h-1 bg-secondary rounded-full cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setVolume(Math.round(((e.clientX - rect.left) / rect.width) * 100));
                  }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${volume}%`, background: "var(--neon-cyan)" }}
                  />
                </div>
                <Icon name="Volume2" size={14} className="text-muted-foreground flex-shrink-0" />
                <span className="text-[10px] font-mono text-muted-foreground w-6 text-right">{volume}</span>
              </div>
            </div>
          )}

          {/* FAVORITES TAB */}
          {tab === "favorites" && (
            <div className="animate-scale-in">
              <h3 className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-4">
                Любимые треки
              </h3>
              {favorites.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="Heart" size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Пока пусто</p>
                  <p className="text-xs mt-1 opacity-50">Нажми ♥ у трека, чтобы сохранить</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {TRACKS.filter((t) => favorites.includes(t.id)).map((t) => {
                    const idx = TRACKS.indexOf(t);
                    return (
                      <div
                        key={t.id}
                        className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all hover:bg-white/5 ${trackIdx === idx && isPlaying ? "bg-neon-violet/10 border border-neon-violet/20" : ""}`}
                        onClick={() => playTrack(idx)}
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl glass">
                          {covers[idx]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{t.title}</p>
                          <p className="text-xs text-muted-foreground font-mono">{t.artist}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">{formatTime(t.duration)}</span>
                          <button onClick={(e) => { e.stopPropagation(); toggleFav(t.id); }}>
                            <Icon name="Heart" size={14} className="text-neon-pink fill-neon-pink" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* HISTORY TAB */}
          {tab === "history" && (
            <div className="animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                  История
                </h3>
                <button
                  onClick={() => setHistory([])}
                  className="text-[10px] font-mono text-muted-foreground hover:text-destructive transition-colors"
                >
                  Очистить
                </button>
              </div>
              {history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="Clock" size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">История пуста</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {history.slice(0, 10).map((h, i) => {
                    const t = TRACKS.find((tr) => tr.id === h.id);
                    if (!t) return null;
                    const idx = TRACKS.indexOf(t);
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-white/5 transition-all"
                        onClick={() => playTrack(idx)}
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl glass">
                          {covers[idx]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{t.title}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{h.ts}</p>
                        </div>
                        <Icon name="Play" size={12} className="text-muted-foreground" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {tab === "settings" && (
            <div className="animate-scale-in flex flex-col gap-5">
              <h3 className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                Настройки
              </h3>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Усиление басов</span>
                  <span className="text-xs font-mono text-neon-violet">{bassBoost}%</span>
                </div>
                <div
                  className="relative w-full h-1.5 bg-secondary rounded-full cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setBassBoost(Math.round(((e.clientX - rect.left) / rect.width) * 100));
                  }}
                >
                  <div className="h-full rounded-full" style={{ width: `${bassBoost}%`, background: "var(--neon-violet)" }} />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 glass rounded-2xl">
                <div>
                  <p className="text-sm font-medium">Пространственный звук</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">3D-эффект окружения</p>
                </div>
                <button
                  onClick={() => setSpatialAudio(!spatialAudio)}
                  className={`w-11 h-6 rounded-full transition-all relative ${spatialAudio ? "bg-neon-violet/80" : "bg-secondary"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${spatialAudio ? "left-5" : "left-0.5"}`} />
                </button>
              </div>

              <div>
                <p className="text-sm font-medium mb-3">Эквалайзер</p>
                <div className="grid grid-cols-3 gap-2">
                  {["Нейтральный", "Бас", "Вокал", "Рок", "Джаз", "Космос"].map((preset) => (
                    <button
                      key={preset}
                      className="py-2 px-1 glass rounded-xl text-[10px] font-mono hover:bg-neon-violet/20 hover:border-neon-violet/40 hover:text-neon-violet transition-all border border-transparent"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-3">Акцентный цвет</p>
                <div className="flex gap-3">
                  {[
                    { name: "violet", color: "#a855f7" },
                    { name: "cyan", color: "#22d3ee" },
                    { name: "pink", color: "#f472b6" },
                    { name: "green", color: "#34d399" },
                    { name: "orange", color: "#fb923c" },
                  ].map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setAccentColor(c.name)}
                      className={`w-8 h-8 rounded-full transition-all ${accentColor === c.name ? "ring-2 ring-white/50 ring-offset-2 ring-offset-background scale-110" : ""}`}
                      style={{ background: c.color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-3">Очередь треков</p>
                <div className="flex flex-col gap-1">
                  {TRACKS.map((t, i) => (
                    <div
                      key={t.id}
                      className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-white/5 transition-all ${i === trackIdx ? "bg-neon-violet/10" : ""}`}
                      onClick={() => playTrack(i)}
                    >
                      <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{t.title}</p>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{formatTime(t.duration)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mini player bar */}
        {tab !== "player" && (
          <div
            className="glass rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-all animate-fade-in"
            onClick={() => setTab("player")}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl glass flex-shrink-0">
              {covers[trackIdx]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{track.title}</p>
              <p className="text-[10px] font-mono text-muted-foreground">{isPlaying ? "▶ Играет" : "⏸ Пауза"}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(!isPlaying);
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all text-background"
              style={{ background: "linear-gradient(135deg, var(--neon-violet), var(--neon-cyan))" }}
            >
              <Icon name={isPlaying ? "Pause" : "Play"} size={16} />
            </button>
          </div>
        )}

        <p className="text-center text-[10px] font-mono text-muted-foreground opacity-40 pb-2">
          MONARCH PLAYER · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}