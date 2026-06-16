import type { MatchStatus } from "@/types";

type BadgeProps = {
  status: MatchStatus;
  className?: string;
};

const statusLabel: Record<MatchStatus, string> = {
  scheduled: "Agendado",
  live: "Ao Vivo",
  finished: "Encerrado",
  postponed: "Adiado",
  cancelled: "Cancelado"
};

const statusClasses: Record<MatchStatus, string> = {
  scheduled: "border-slate-500/30 bg-slate-500/10 text-slate-200",
  live: "border-red-400/30 bg-red-500/10 text-red-100 shadow-[0_0_0_1px_rgba(248,113,113,0.12)]",
  finished: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
  postponed: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  cancelled: "border-rose-400/30 bg-rose-500/10 text-rose-100"
};

export function Badge({ status, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide ${statusClasses[status]} ${className}`}
    >
      {statusLabel[status]}
    </span>
  );
}
