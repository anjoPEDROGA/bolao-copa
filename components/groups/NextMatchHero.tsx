"use client";

import type { Match } from "@/types";
import { FlagIcon } from "@/components/ui/FlagIcon";
import { Badge } from "@/components/ui/Badge";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { getStadiumInfo, getStadiumTimezone, getTeamName } from "@/lib/translations";
import { formatMatchTime } from "@/lib/datetime";

type NextMatchHeroProps = {
  match: Match | null;
};

export function NextMatchHero({ match }: NextMatchHeroProps) {
  if (!match) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#0f1727] p-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-sky-300/80">
          Próximo Jogo
        </p>
        <p className="mt-2 text-sm text-slate-300">Nenhum jogo futuro encontrado.</p>
      </section>
    );
  }

  const homeTeamName = getTeamName(match.homeTeamId);
  const awayTeamName = getTeamName(match.awayTeamId);
  const stadiumInfo = getStadiumInfo(match.stadiumId);
  const stadiumLabel = stadiumInfo
    ? stadiumInfo.city
      ? `${stadiumInfo.name} · ${stadiumInfo.city}`
      : stadiumInfo.name
    : match.stadiumId;
  const kickoffLabel = formatMatchTime(match.kickoffAt, getStadiumTimezone(match.stadiumId));

  return (
    <section className="overflow-hidden rounded-2xl border border-sky-300/20 bg-[linear-gradient(135deg,rgba(14,22,39,0.98),rgba(8,12,22,0.98))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-sky-300/80">
            Próximo Jogo
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">Começa em breve</h2>
        </div>
        <Badge status={match.status} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
          <FlagIcon size={28} teamId={match.homeTeamId} alt={`Bandeira de ${homeTeamName}`} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{homeTeamName}</p>
            <p className="text-[11px] text-slate-400">{kickoffLabel}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 px-2 text-center">
          <span className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
            Começa em
          </span>
          <span className="text-xl font-semibold text-white">
            <CountdownTimer targetIsoDate={match.kickoffAt} />
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
          <div className="min-w-0 text-right">
            <p className="truncate text-sm font-semibold text-white">{awayTeamName}</p>
            <p className="text-[11px] text-slate-400">{stadiumLabel}</p>
          </div>
          <FlagIcon size={28} teamId={match.awayTeamId} alt={`Bandeira de ${awayTeamName}`} />
        </div>
      </div>
    </section>
  );
}
