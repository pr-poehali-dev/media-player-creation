export function Visualizer({ isPlaying, bassLevel }: { isPlaying: boolean; bassLevel: number }) {
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

export function OrbitDisc({ isPlaying, cover }: { isPlaying: boolean; cover: string }) {
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

export function ParticleField({ isPlaying }: { isPlaying: boolean }) {
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
