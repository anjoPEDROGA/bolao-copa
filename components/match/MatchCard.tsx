"use client";

import type { Match } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { MatchTimer } from "@/components/ui/MatchTimer";
import { FlagIcon } from "@/components/ui/FlagIcon";
import { formatMatchTime } from "@/lib/datetime";
import { getStadiumInfo, getStadiumTimezone, getTeamName } from "@/lib/translations";
import { motion } from "framer-motion";

type MatchCardProps = {
  match: Match;
  isFavorite?: boolean;
  className?: string;
};

function renderScore(value: number | null): string {
  return value === null ? "-" : String(value);
}

function renderStatusSummary(match: Match): string {
  if (match.status === "scheduled") {
    return "Programado";
  }

  if (match.status === "live") {
    return typeof match.minute === "number" ? `${match.minute}' em jogo` : "Ao vivo";
  }

  if (match.status === "finished") {
    return "Encerrado";
  }

  if (match.status === "postponed") {
    return "Adiado";
  }

  return "Cancelado";
}

export function MatchCard({
  match,
  isFavorite = false,
  className = ""
}: MatchCardProps) {
  const stadiumInfo = getStadiumInfo(match.stadiumId);
  const timezone = getStadiumTimezone(match.stadiumId);
  const matchTime = formatMatchTime(match.kickoffAt, timezone);
  const homeTeamName = getTeamName(match.homeTeamId);
  const awayTeamName = getTeamName(match.awayTeamId);
  const stadiumLabel = stadiumInfo
    ? stadiumInfo.city
      ? `${stadiumInfo.name} · ${stadiumInfo.city}`
      : stadiumInfo.name
    : match.stadiumId;
  const stageTone =
    match.status === "live"
      ? "from-red-500/10 via-red-500/[0.03] to-transparent"
      : match.status === "finished"
        ? "from-emerald-500/10 via-emerald-500/[0.03] to-transparent"
        : "from-white/5 via-white/[0.02] to-transparent";

  return (
    <motion.article
      className={`group relative overflow-hidden rounded-2xl border bg-[#0f1727] p-3 shadow-[0_14px_40px_rgba(0,0,0,0.18)] transition ${
        isFavorite
          ? "border-sky-300/30 shadow-[0_0_0_1px_rgba(125,211,252,0.15),0_14px_40px_rgba(0,0,0,0.18)]"
          : "border-white/10"
      } ${className}`}
      initial={{ opacity: 0, y: 6 }}
      whileHover={{ y: -1, borderColor: "rgba(125,211,252,0.24)" }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${stageTone} pointer-events-none`} />

      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
              {matchTime}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-slate-300">{stadiumLabel}</p>
          </div>
          <Badge status={match.status} className="shrink-0" />
        </div>

        <div className="mt-3 grid gap-2">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-xl border border-white/5 bg-white/[0.04] px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <FlagIcon
                size={20}
                teamId={match.homeTeamId}
                alt={`Bandeira de ${homeTeamName}`}
              />
              <span className="min-w-0 truncate text-sm font-medium text-white">
                {homeTeamName}
              </span>
            </div>

            <div className="flex flex-col items-center px-1 text-center">
              <span className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                {match.status === "live"
                  ? "Ao vivo"
                  : match.status === "finished"
                    ? "Placar"
                    : "VS"}
              </span>
              <span className="text-lg font-semibold leading-none text-white">
                {match.status === "live" || match.status === "finished"
                  ? `${renderScore(match.score.home)} x ${renderScore(match.score.away)}`
                  : "x"}
              </span>
            </div>

            <div className="flex min-w-0 items-center justify-end gap-2">
              <span className="min-w-0 truncate text-right text-sm font-medium text-white">
                {awayTeamName}
              </span>
              <FlagIcon
                size={20}
                teamId={match.awayTeamId}
                alt={`Bandeira de ${awayTeamName}`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-[11px] text-slate-200">
            <span className="truncate">{renderStatusSummary(match)}</span>
            <span className="truncate text-right text-slate-300">{stadiumLabel}</span>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-xs text-slate-200">
            <span className="truncate">
              {match.status === "scheduled" ? (
                <CountdownTimer targetIsoDate={match.kickoffAt} />
              ) : match.status === "live" ? (
                <MatchTimer kickoffIsoDate={match.kickoffAt} minute={match.minute} />
              ) : match.status === "finished" ? (
                <span>Encerrado</span>
              ) : match.status === "postponed" ? (
                <span>Adiado</span>
              ) : (
                <span>Cancelado</span>
              )}
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
              {match.stage}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
