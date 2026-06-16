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
    ? `${stadiumInfo.name} · ${stadiumInfo.city}`
    : match.stadiumId;
  const statusTone =
    match.status === "live"
      ? "border-red-400/30"
      : match.status === "finished"
        ? "border-emerald-400/20"
        : match.status === "postponed" || match.status === "cancelled"
          ? "border-amber-400/20"
          : "border-white/10";

  return (
    <motion.article
      className={`rounded-2xl border bg-[#0f1727] p-3 shadow-[0_16px_48px_rgba(0,0,0,0.22)] transition ${
        isFavorite
          ? "border-sky-300/30 shadow-[0_0_0_1px_rgba(125,211,252,0.15),0_16px_48px_rgba(0,0,0,0.22)]"
          : statusTone
      } ${className}`}
      initial={{ opacity: 0, y: 6 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
            {matchTime}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-300">{stadiumLabel}</p>
        </div>
        <Badge status={match.status} className="shrink-0" />
      </div>

      <div className="mt-3 grid gap-2">
        <div className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <FlagIcon size={20} teamId={match.homeTeamId} alt={`Bandeira de ${homeTeamName}`} />
            <span className="min-w-0 truncate text-sm font-medium text-white">
              {homeTeamName}
            </span>
          </div>
          <span className="text-base font-semibold text-white">
            {renderScore(match.score.home)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <FlagIcon size={20} teamId={match.awayTeamId} alt={`Bandeira de ${awayTeamName}`} />
            <span className="min-w-0 truncate text-sm font-medium text-white">
              {awayTeamName}
            </span>
          </div>
          <span className="text-base font-semibold text-white">
            {renderScore(match.score.away)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-xs text-slate-200">
        {match.status === "scheduled" ? (
          <CountdownTimer targetIsoDate={match.kickoffAt} />
        ) : match.status === "live" ? (
          <MatchTimer kickoffIsoDate={match.kickoffAt} minute={match.minute} />
        ) : match.status === "finished" ? (
          <span>Placar final</span>
        ) : match.status === "postponed" ? (
          <span>Jogo adiado</span>
        ) : (
          <span>Jogo cancelado</span>
        )}

        <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
          {match.stage}
        </span>
      </div>
    </motion.article>
  );
}
