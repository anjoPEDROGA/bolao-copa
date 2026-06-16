"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Banner } from "@/components/ui/Banner";
import { FlagIcon } from "@/components/ui/FlagIcon";
import { MotionPage } from "@/components/ui/MotionPage";
import { MatchList } from "@/components/match/MatchList";
import { MatchCardSkeleton } from "@/components/match/MatchCardSkeleton";
import { useGroupStandings } from "@/hooks/useGroupStandings";
import { findTeamDetail } from "@/lib/teams";
import { getTeamName } from "@/lib/translations";
import type { TeamDetailEntry } from "@/lib/teams";

type TeamDetailClientProps = {
  teamId: string;
};

function formatPosition(position: number): string {
  return `${position}º lugar`;
}

function StatCard({
  label,
  value,
  tone = "default"
}: {
  label: string;
  value: string | number;
  tone?: "default" | "accent";
}) {
  const toneClass =
    tone === "accent"
      ? "border-sky-300/20 bg-sky-500/10 text-sky-50"
      : "border-white/10 bg-white/[0.04] text-slate-100";

  return (
    <div className={`rounded-2xl border px-3 py-2.5 ${toneClass}`}>
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function renderGoalDifference(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function TeamDetailHero({ team }: { team: TeamDetailEntry }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,39,0.98),rgba(7,11,20,0.98))] p-4 shadow-[0_22px_60px_rgba(0,0,0,0.22)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-4">
          <FlagIcon size={64} teamId={team.teamId} alt={`Bandeira de ${team.teamName}`} />
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-sky-300/80">
              Seleção
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-white">{team.teamName}</h1>
            <p className="mt-1 text-sm text-slate-300">
              {team.groupLabel} · {formatPosition(team.position)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4 md:min-w-[420px]">
          <StatCard label="Pontos" tone="accent" value={team.points} />
          <StatCard label="Saldo" value={renderGoalDifference(team.goalDifference)} />
          <StatCard label="GP" value={team.goalsFor} />
          <StatCard label="GC" value={team.goalsAgainst} />
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        <StatCard label="Jogos" value={team.played} />
        <StatCard label="Vitórias" value={team.won} />
        <StatCard label="Empates" value={team.drawn} />
        <StatCard label="Derrotas" value={team.lost} />
      </div>
    </section>
  );
}

export function TeamDetailClient({ teamId }: TeamDetailClientProps) {
  const { groups, standingsByGroup, matches, isLoading, isError } = useGroupStandings();

  const team = useMemo(
    () => findTeamDetail(teamId, groups, standingsByGroup, matches),
    [teamId, groups, matches, standingsByGroup]
  );

  const teamName = getTeamName(teamId);

  if (isLoading) {
    return (
      <main className="page-shell">
        <MotionPage className="w-full max-w-6xl space-y-6">
          <section className="page-card space-y-3">
            <p className="page-kicker">Bolão Copa 2026</p>
            <h1 className="page-title text-3xl">Carregando seleção...</h1>
          </section>
          <section className="grid gap-3">
            <MatchCardSkeleton />
            <MatchCardSkeleton />
          </section>
        </MotionPage>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="page-shell">
        <MotionPage className="w-full max-w-6xl space-y-6">
          <Banner variant="danger">Não foi possível carregar os dados desta seleção.</Banner>
        </MotionPage>
      </main>
    );
  }

  if (!team) {
    return (
      <main className="page-shell">
        <MotionPage className="w-full max-w-6xl space-y-6">
          <section className="page-card space-y-3">
            <p className="page-kicker">Bolão Copa 2026</p>
            <h1 className="page-title text-3xl">Seleção não encontrada</h1>
            <p className="page-copy text-sm">
              Não localizamos os dados de {teamName} nesta base no momento.
            </p>
            <Link
              className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              href="/times"
            >
              Voltar para times
            </Link>
          </section>
        </MotionPage>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <MotionPage className="w-full max-w-6xl space-y-6">
        <section className="page-card space-y-3">
          <p className="page-kicker">Bolão Copa 2026</p>
          <h1 className="page-title text-3xl">Detalhe da Seleção</h1>
          <p className="page-copy text-sm">
            Posição, estatísticas e os jogos já vinculados à seleção.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white transition hover:bg-white/10"
              href="/times"
            >
              Voltar para times
            </Link>
            <Link
              className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white transition hover:bg-white/10"
              href="/grupos"
            >
              Ver grupos
            </Link>
          </div>
        </section>

        <TeamDetailHero team={team} />

        <section className="grid gap-3 md:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-white/10 bg-[#0f1727]/95 p-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-sky-300/80">
                Jogos disputados
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                {team.playedMatches.length > 0
                  ? `${team.playedMatches.length} partidas`
                  : "Nenhuma partida disputada"}
              </h2>
            </div>
            <MatchList
              emptyMessage="Ainda sem jogos disputados."
              matches={team.playedMatches}
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-[#0f1727]/95 p-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-sky-300/80">
                Próximos jogos
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                {team.upcomingMatches.length > 0
                  ? `${team.upcomingMatches.length} partidas`
                  : "Nenhum jogo futuro"}
              </h2>
            </div>
            <MatchList
              emptyMessage="Nenhum jogo futuro disponível."
              matches={team.upcomingMatches}
            />
          </div>
        </section>
      </MotionPage>
    </main>
  );
}

