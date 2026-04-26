import Icon from "@/components/ui/icon";

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: number;
  genre: string;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

interface FavoritesTabProps {
  tracks: Track[];
  covers: string[];
  favorites: number[];
  trackIdx: number;
  isPlaying: boolean;
  onPlay: (idx: number) => void;
  onToggleFav: (id: number) => void;
}

export function FavoritesTab({ tracks, covers, favorites, trackIdx, isPlaying, onPlay, onToggleFav }: FavoritesTabProps) {
  return (
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
          {tracks.filter((t) => favorites.includes(t.id)).map((t) => {
            const idx = tracks.indexOf(t);
            return (
              <div
                key={t.id}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all hover:bg-white/5 ${trackIdx === idx && isPlaying ? "bg-neon-violet/10 border border-neon-violet/20" : ""}`}
                onClick={() => onPlay(idx)}
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
                  <button onClick={(e) => { e.stopPropagation(); onToggleFav(t.id); }}>
                    <Icon name="Heart" size={14} className="text-neon-pink fill-neon-pink" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface HistoryTabProps {
  history: { id: number; ts: string }[];
  tracks: Track[];
  covers: string[];
  onPlay: (idx: number) => void;
  onClear: () => void;
}

export function HistoryTab({ history, tracks, covers, onPlay, onClear }: HistoryTabProps) {
  return (
    <div className="animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xs uppercase tracking-widest text-muted-foreground">
          История
        </h3>
        <button
          onClick={onClear}
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
            const t = tracks.find((tr) => tr.id === h.id);
            if (!t) return null;
            const idx = tracks.indexOf(t);
            return (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-white/5 transition-all"
                onClick={() => onPlay(idx)}
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
  );
}

interface SettingsTabProps {
  tracks: Track[];
  trackIdx: number;
  bassBoost: number;
  spatialAudio: boolean;
  accentColor: string;
  onSetBassBoost: (v: number) => void;
  onToggleSpatial: () => void;
  onSetAccentColor: (v: string) => void;
  onPlayTrack: (idx: number) => void;
}

export function SettingsTab({
  tracks,
  trackIdx,
  bassBoost,
  spatialAudio,
  accentColor,
  onSetBassBoost,
  onToggleSpatial,
  onSetAccentColor,
  onPlayTrack,
}: SettingsTabProps) {
  return (
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
            onSetBassBoost(Math.round(((e.clientX - rect.left) / rect.width) * 100));
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
          onClick={onToggleSpatial}
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
              onClick={() => onSetAccentColor(c.name)}
              className={`w-8 h-8 rounded-full transition-all ${accentColor === c.name ? "ring-2 ring-white/50 ring-offset-2 ring-offset-background scale-110" : ""}`}
              style={{ background: c.color }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-3">Очередь треков</p>
        <div className="flex flex-col gap-1">
          {tracks.map((t, i) => (
            <div
              key={t.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-white/5 transition-all ${i === trackIdx ? "bg-neon-violet/10" : ""}`}
              onClick={() => onPlayTrack(i)}
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
  );
}
