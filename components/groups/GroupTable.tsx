import type { Standing } from "@/types";
import { getTeamName } from "@/lib/translations";

type GroupTableProps = {
  standings: Standing[];
  favoriteTeamIds?: string[];
  className?: string;
};

export function GroupTable({
  standings,
  favoriteTeamIds = [],
  className = ""
}: GroupTableProps) {
  if (standings.length === 0) {
    return (
      <div
        className={`rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 ${className}`}
      >
        Classificação ainda indisponível.
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-white/10 bg-[#0f1727] ${className}`}>
      <div className="min-w-[680px]">
        <div className="grid grid-cols-[2rem_1.4fr_repeat(9,minmax(2rem,auto))] gap-1.5 border-b border-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
          <span>Pos</span>
          <span>Seleção</span>
          <span>J</span>
          <span>V</span>
          <span>E</span>
          <span>D</span>
          <span>GP</span>
          <span>GC</span>
          <span>SG</span>
          <span>Pts</span>
        </div>

        <div className="divide-y divide-white/5">
          {standings.map((standing, index) => {
            const isPodium = index < 2;
            const isFavorite = favoriteTeamIds.includes(standing.teamId);

            return (
              <div
                key={standing.teamId}
                className={`grid grid-cols-[2rem_1.4fr_repeat(9,minmax(2rem,auto))] gap-1.5 px-3 py-2 text-xs ${
                  isFavorite ? "bg-sky-300/5 text-sky-50" : "text-slate-200"
                } ${isPodium ? "ring-1 ring-emerald-400/10" : ""}`}
              >
                <span className="font-semibold text-slate-400">{index + 1}</span>
                <span className="min-w-0 truncate font-medium">
                  {getTeamName(standing.teamId)}
                </span>
                <span>{standing.played}</span>
                <span>{standing.won}</span>
                <span>{standing.drawn}</span>
                <span>{standing.lost}</span>
                <span>{standing.goalsFor}</span>
                <span>{standing.goalsAgainst}</span>
                <span>{standing.goalDifference}</span>
                <span className="font-semibold text-white">{standing.points}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
