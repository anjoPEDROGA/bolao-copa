import type { ReactNode } from "react";

type SummaryCardProps = {
  label: string;
  value: number;
  tone: "live" | "finished" | "scheduled";
  icon?: ReactNode;
  className?: string;
};

const toneClasses: Record<SummaryCardProps["tone"], string> = {
  live: "border-red-400/20 bg-red-500/10 text-red-100",
  finished: "border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
  scheduled: "border-sky-400/20 bg-sky-500/10 text-sky-100"
};

export function MatchSummaryCard({
  label,
  value,
  tone,
  icon,
  className = ""
}: SummaryCardProps) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.12)] ${toneClasses[tone]} ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/75">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
        </div>
        {icon ? <div className="text-white/85">{icon}</div> : null}
      </div>
    </div>
  );
}
