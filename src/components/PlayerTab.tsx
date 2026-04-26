import Icon from "@/components/ui/icon";
import { Visualizer } from "@/components/PlayerVisuals";

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

interface PlayerTabProps {
  track: Track;
  trackIdx: number;
  covers: string[];
  isPlaying: boolean;
  progress: number;
  volume: number;
  shuffle: boolean;
  repeat: boolean;
  favorites: number[];
  bassLevel: number;
  onToggleFav: (id: number) => void;
  onSetProgress: (v: number) => void;
  onSetVolume: (v: number) => void;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSetShuffle: (v: boolean) => void;
  onSetRepeat: (v: boolean) => void;
}

export function PlayerTab({
  track,
  trackIdx,
  covers,
  isPlaying,
  progress,
  volume,
  shuffle,
  repeat,
  favorites,
  bassLevel,
  onToggleFav,
  onSetProgress,
  onSetVolume,
  onTogglePlay,
  onPrev,
  onNext,
  onSetShuffle,
  onSetRepeat,
}: PlayerTabProps) {
  return (
    <div className="flex flex-col items-center gap-6 animate-scale-in">
      {/* Cover */}
      <div className="w-full aspect-square rounded-2xl overflow-hidden relative"
        style={{ background: "radial-gradient(circle at 40% 35%, #1a0a2e, #0a0a1a)" }}>
        <div className="absolute inset-0 flex items-center justify-center text-[120px]">
          {covers[trackIdx]}
        </div>
        <div className="absolute inset-0" style={{
          background: "radial-gradient(circle at 30% 25%, rgba(168,85,247,0.2), transparent 60%)",
        }} />
        {isPlaying && (
          <div className="absolute inset-0 animate-pulse" style={{
            background: "radial-gradient(circle at 50% 100%, rgba(168,85,247,0.15), transparent 60%)",
          }} />
        )}
      </div>

      <div className="text-center w-full">
        <div className="flex items-center justify-center gap-2 mb-1">
          <h2 className="font-display text-base font-semibold tracking-tight leading-tight">{track.title}</h2>
          <button onClick={() => onToggleFav(track.id)}>
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
          className="relative w-full h-3 bg-secondary rounded-full cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            onSetProgress(Math.round(ratio * track.duration));
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
          onClick={() => onSetShuffle(!shuffle)}
          className={`p-2 rounded-full transition-all ${shuffle ? "text-neon-cyan" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Icon name="Shuffle" size={16} />
        </button>
        <button onClick={onPrev} className="p-3 glass rounded-full hover:bg-white/10 transition-all text-foreground">
          <Icon name="SkipBack" size={20} />
        </button>
        <button
          onClick={onTogglePlay}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all glow-violet text-background font-bold"
          style={{ background: "linear-gradient(135deg, var(--neon-violet), var(--neon-cyan))" }}
        >
          <Icon name={isPlaying ? "Pause" : "Play"} size={26} />
        </button>
        <button onClick={onNext} className="p-3 glass rounded-full hover:bg-white/10 transition-all text-foreground">
          <Icon name="SkipForward" size={20} />
        </button>
        <button
          onClick={() => onSetRepeat(!repeat)}
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
            onSetVolume(Math.round(((e.clientX - rect.left) / rect.width) * 100));
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
  );
}
