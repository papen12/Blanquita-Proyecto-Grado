export function MiniStat({ label, value }) {
  return (
    <div className="flex-1 rounded-lg border border-slate-200 bg-white/70 px-2.5 py-1.5">
      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="text-sm font-bold tabular-nums text-slate-900">
        {value}
      </div>
    </div>
  );
}