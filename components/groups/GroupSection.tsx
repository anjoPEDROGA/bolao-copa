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
  const groupMatches = matches;

  return (
    <section
      className={`space-y-4 rounded-3xl border border-white/10 bg-white/3 p-4 ${className}`}
    >
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-300/80">
          Grupo
        </p>
        <h2 className="text-2xl font-semibold text-white">{group.name}</h2>
      </div>

      <GroupTable favoriteTeamIds={favoriteTeamIds} standings={standings} />

      <MatchList
        emptyMessage="Jogos deste grupo ainda não disponíveis."
        favoriteTeamIds={favoriteTeamIds}
        matches={groupMatches}
      />
    </section>
  );
}
