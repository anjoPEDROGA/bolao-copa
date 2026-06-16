import type { Group, Match, Standing } from "@/types";
import { GroupTable } from "./GroupTable";
import { MatchList } from "@/components/match/MatchList";

type GroupSectionProps = {
  group: Group;
  standings: Standing[];
  matches: Match[];
  favoriteTeamIds?: string[];
  className?: string;
};

export function GroupSection({
  group,
  standings,
  matches,
  favoriteTeamIds = [],
  className = ""
}: GroupSectionProps) {
  return (
    <section
      className={`space-y-3 rounded-2xl border border-white/10 bg-[#0f1727]/95 p-3 ${className}`}
    >
      <div className="space-y-0.5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-sky-300/80">
          Grupo
        </p>
        <h2 className="text-xl font-semibold text-white">{group.name}</h2>
      </div>

      <GroupTable favoriteTeamIds={favoriteTeamIds} standings={standings} />

      <MatchList
        emptyMessage="Jogos deste grupo ainda não disponíveis."
        favoriteTeamIds={favoriteTeamIds}
        matches={matches}
      />
    </section>
  );
}
