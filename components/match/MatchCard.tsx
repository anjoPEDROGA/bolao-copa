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
      className={`rounded-3xl border bg-[#0f1727] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] transition ${
        isFavorite
          ? "border-sky-300/30 shadow-[0_0_0_1px_rgba(125,211,252,0.15),0_24px_80px_rgba(0,0,0,0.25)]"
          : statusTone
      } ${className}`}
      initial={{ opacity: 0, y: 8 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            {matchTime}
          </p>
          <p className="mt-1 text-sm text-slate-300">
            {stadiumInfo ? `${stadiumInfo.name} • ${stadiumInfo.city}` : match.stadiumId}
          </p>
        </div>
        <Badge status={match.status} />
      </div>

      <div className="mt-5 grid gap-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <FlagIcon teamId={match.homeTeamId} alt={`Bandeira de ${homeTeamName}`} />
            <span className="truncate font-medium text-white">{homeTeamName}</span>
          </div>
          <span className="text-xl font-semibold text-white">
            {renderScore(match.score.home)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <FlagIcon teamId={match.awayTeamId} alt={`Bandeira de ${awayTeamName}`} />
            <span className="truncate font-medium text-white">{awayTeamName}</span>
          </div>
          <span className="text-xl font-semibold text-white">
            {renderScore(match.score.away)}
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-black/20 px-4 py-3 text-sm text-slate-200">
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

        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
          {match.stage}
        </span>
      </div>
    </motion.article>
  );
}
