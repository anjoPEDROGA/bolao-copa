import type { Match } from "@/types";
import { MatchCard } from "./MatchCard";

type MatchListProps = {
  matches: Match[];
  favoriteTeamIds?: string[];
  emptyMessage?: string;
  className?: string;
};

export function MatchList({
  matches,
  favoriteTeamIds = [],
  emptyMessage = "Nenhuma partida disponível no momento.",
  className = ""
}: MatchListProps) {
  if (matches.length === 0) {
    return (
      <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      {matches.map((match) => {
        const isFavorite =
          favoriteTeamIds.includes(match.homeTeamId) ||
          favoriteTeamIds.includes(match.awayTeamId);

        return (
          <MatchCard
            key={match.id}
            isFavorite={isFavorite}
            match={match}
          />
        );
      })}
    </div>
  );
}
