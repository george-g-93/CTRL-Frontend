export default function CTRLMark({ small }) {
  return (
    <div className={(small ? "h-7 w-7" : "h-9 w-9") + " relative grid place-items-center rounded-xl overflow-hidden bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-white/10 shadow-inner"}>
      <div className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,_transparent_0deg,_white/20_90deg,_transparent_180deg,_transparent_360deg)]" />
      <div className="flex items-center gap-0.5">
        <span className="h-1.5 w-1.5 rounded-sm bg-emerald-300" />
        <span className="h-1.5 w-1.5 rounded-sm bg-emerald-300" />
        <span className="h-1.5 w-1.5 rounded-sm bg-emerald-300" />
        <span className="h-1.5 w-1.5 rounded-sm bg-emerald-300" />
      </div>
    </div>
  );
}
