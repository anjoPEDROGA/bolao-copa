"use client";

import type { BracketMatch } from "@/types";
import { getTeamName } from "@/lib/translations";
import { motion } from "framer-motion";

type BracketMatchProps = {
  match: BracketMatch;
  className?: string;
};

function renderTeamName(teamId?: string | null): string {
  if (!teamId) {
    return "A definir";
  }

  return getTeamName(teamId);
}

export function BracketMatch({ match, className = "" }: BracketMatchProps) {
  return (
    <motion.article
      className={`rounded-2xl border border-white/10 bg-[#0f1727] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.2)] ${className}`}
      initial={{ opacity: 0, y: 8 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-white">
          {renderTeamName(match.homeTeamId)}
          {!match.homeTeamId && match.sourceHome ? (
            <span className="ml-2 text-xs text-slate-400">{match.sourceHome}</span>
          ) : null}
        </div>
        <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-white">
          {renderTeamName(match.awayTeamId)}
          {!match.awayTeamId && match.sourceAway ? (
            <span className="ml-2 text-xs text-slate-400">{match.sourceAway}</span>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}
