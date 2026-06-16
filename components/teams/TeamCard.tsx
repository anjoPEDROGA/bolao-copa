import Link from "next/link";
import { motion } from "framer-motion";
import { FlagIcon } from "@/components/ui/FlagIcon";
import type { TeamCatalogEntry } from "@/lib/teams";

type TeamCardProps = {
  team: TeamCatalogEntry;
  className?: string;
};

function formatPosition(position: number): string {
  return `${position}º`;
}

export function TeamCard({ team, className = "" }: TeamCardProps) {
  return (
    <Link className="block h-full" href={`/times/${team.teamId}`}>
      <motion.article
        className={`group h-full rounded-2xl border border-white/10 bg-[#0f1727] p-3 shadow-[0_14px_40px_rgba(0,0,0,0.18)] transition hover:border-sky-300/25 ${className}`}
        initial={{ opacity: 0, y: 8 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <FlagIcon
              size={34}
              teamId={team.teamId}
              alt={`Bandeira de ${team.teamName}`}
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{team.teamName}</p>
              <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
                {team.groupLabel}
              </p>
            </div>
          </div>

          <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-right">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Posição</p>
            <p className="text-lg font-semibold text-white">{formatPosition(team.position)}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-300 sm:grid-cols-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.04] px-2 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Pontos</p>
            <p className="mt-0.5 text-sm font-semibold text-white">{team.points}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.04] px-2 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Saldo</p>
            <p className="mt-0.5 text-sm font-semibold text-white">
              {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.04] px-2 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">GP</p>
            <p className="mt-0.5 text-sm font-semibold text-white">{team.goalsFor}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.04] px-2 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">GC</p>
            <p className="mt-0.5 text-sm font-semibold text-white">{team.goalsAgainst}</p>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

