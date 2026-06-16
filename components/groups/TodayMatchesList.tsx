import type { Match } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { FlagIcon } from "@/components/ui/FlagIcon";
import { compareIsoDateAsc, formatMatchTime, isSameUserLocalDay } from "@/lib/datetime";
import { getStadiumInfo, getStadiumTimezone, getTeamName } from "@/lib/translations";

type TodayMatchesListProps = {
  matches: Match[];
};

export function TodayMatchesList({ matches }: TodayMatchesListProps) {
  const todayMatches = [...matches]
    .filter((match) => isSameUserLocalDay(match.kickoffAt))
    .sort((left, right) => compareIsoDateAsc(left.kickoffAt, right.kickoffAt));

  return (
    <section className="rounded-2xl border border-white/10 bg-[#0f1727] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-sky-300/80">
            Jogos de Hoje
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            {todayMatches.length > 0 ? `${todayMatches.length} partidas` : "Nenhum jogo hoje"}
          </h2>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {todayMatches.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-slate-300">
            Nenhum jogo hoje
          </p>
        ) : (
          todayMatches.map((match) => {
            const homeTeamName = getTeamName(match.homeTeamId);
            const awayTeamName = getTeamName(match.awayTeamId);
            const stadiumInfo = getStadiumInfo(match.stadiumId);
            const stadiumLabel = stadiumInfo
              ? stadiumInfo.city
                ? `${stadiumInfo.name} · ${stadiumInfo.city}`
                : stadiumInfo.name
              : match.stadiumId;

            return (
              <article
                key={match.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <FlagIcon size={18} teamId={match.homeTeamId} alt={`Bandeira de ${homeTeamName}`} />
                  <span className="truncate text-sm text-white">{homeTeamName}</span>
                  <span className="text-xs text-slate-500">x</span>
                  <FlagIcon size={18} teamId={match.awayTeamId} alt={`Bandeira de ${awayTeamName}`} />
                  <span className="truncate text-sm text-white">{awayTeamName}</span>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                  <Badge status={match.status} />
                  <p className="text-[11px] text-slate-300">
                    {formatMatchTime(match.kickoffAt, getStadiumTimezone(match.stadiumId))}
                  </p>
                  <p className="max-w-[220px] truncate text-[11px] text-slate-400">
                    {stadiumLabel}
                  </p>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
