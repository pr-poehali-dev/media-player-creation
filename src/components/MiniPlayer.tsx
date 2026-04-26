import Icon from "@/components/ui/icon";

interface MiniPlayerProps {
  cover: string;
  title: string;
  isPlaying: boolean;
  onGoToPlayer: () => void;
  onTogglePlay: (e: React.MouseEvent) => void;
}

export function MiniPlayer({ cover, title, isPlaying, onGoToPlayer, onTogglePlay }: MiniPlayerProps) {
  return (
    <div
      className="glass rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-all animate-fade-in"
      onClick={onGoToPlayer}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl glass flex-shrink-0">
        {cover}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-[10px] font-mono text-muted-foreground">{isPlaying ? "▶ Играет" : "⏸ Пауза"}</p>
      </div>
      <button
        onClick={onTogglePlay}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-all text-background"
        style={{ background: "linear-gradient(135deg, var(--neon-violet), var(--neon-cyan))" }}
      >
        <Icon name={isPlaying ? "Pause" : "Play"} size={16} />
      </button>
    </div>
  );
}
