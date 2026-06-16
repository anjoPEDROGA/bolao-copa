"use client";

import { useState, type FormEvent } from "react";
import type { MatchStatus } from "@/types";

type ScoreOverrideFormProps = {
  className?: string;
};

const statusOptions: MatchStatus[] = [
  "scheduled",
  "live",
  "finished",
  "postponed",
  "cancelled"
];

function parseNullableNumber(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

export function ScoreOverrideForm({ className = "" }: ScoreOverrideFormProps) {
  const [matchId, setMatchId] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [status, setStatus] = useState<MatchStatus>("scheduled");
  const [minute, setMinute] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!matchId.trim()) {
      setMessage("Informe o ID da partida.");
      return;
    }

    const scoreHome = parseNullableNumber(homeScore);
    const scoreAway = parseNullableNumber(awayScore);
    const minuteValue = parseNullableNumber(minute);

    if ((homeScore.trim() && scoreHome === null) || (awayScore.trim() && scoreAway === null)) {
      setMessage("Placar inválido.");
      return;
    }

    if (minute.trim() && minuteValue === null) {
      setMessage("Minuto inválido.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/matches/${encodeURIComponent(matchId.trim())}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          score: {
            home: homeScore.trim() ? scoreHome : null,
            away: awayScore.trim() ? scoreAway : null
          },
          status,
          minute: minute.trim() ? minuteValue : null
        })
      });

      const data = (await response.json()) as { ok?: true; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao atualizar.");
      }

      setMessage("Partida atualizada com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao atualizar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      className={`rounded-3xl border border-white/10 bg-[#0f1727] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] ${className}`}
    >
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">
          Override manual de placar
        </h3>
        <p className="text-sm text-slate-300">
          Atualize o placar e o estado de uma partida manualmente.
        </p>
      </div>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Match ID</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/50"
            onChange={(event) => setMatchId(event.target.value)}
            placeholder="match-123"
            value={matchId}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Gols casa</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/50"
              min="0"
              onChange={(event) => setHomeScore(event.target.value)}
              type="number"
              value={homeScore}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">
              Gols visitante
            </span>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/50"
              min="0"
              onChange={(event) => setAwayScore(event.target.value)}
              type="number"
              value={awayScore}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Status</span>
            <select
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-sky-300/50"
              onChange={(event) => setStatus(event.target.value as MatchStatus)}
              value={status}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Minuto</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/50"
              min="0"
              onChange={(event) => setMinute(event.target.value)}
              type="number"
              value={minute}
            />
          </label>
        </div>

        {message ? <p className="text-sm text-slate-300">{message}</p> : null}

        <button
          className="rounded-xl border border-sky-300/20 bg-sky-300/10 px-4 py-3 text-sm font-medium text-sky-50 transition hover:bg-sky-300/15 disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Atualizando..." : "Salvar override"}
        </button>
      </form>
    </section>
  );
}
