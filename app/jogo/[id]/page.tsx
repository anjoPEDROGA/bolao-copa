import type { Metadata } from "next";
import Link from "next/link";
import { MatchCard } from "@/components/match/MatchCard";
import { findMatchById } from "@/lib/api";
import { formatMatchTime } from "@/lib/datetime";
import {
  getMatchStatusLabel,
  getStadiumInfo,
  getStadiumTimezone,
  getTeamName
} from "@/lib/translations";

type MatchPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function buildMatchTitle(matchId: string, match: Awaited<ReturnType<typeof findMatchById>>): string {
  if (!match) {
    return "Jogo não encontrado | Bolão Copa 2026";
  }

  const homeTeamName = getTeamName(match.homeTeamId);
  const awayTeamName = getTeamName(match.awayTeamId);
  const homeScore = match.score.home;
  const awayScore = match.score.away;

  const confrontation =
    typeof homeScore === "number" && typeof awayScore === "number"
      ? `${homeTeamName} ${homeScore} x ${awayScore} ${awayTeamName}`
      : `${homeTeamName} x ${awayTeamName}`;

  return `${confrontation} | Bolão Copa 2026`;
}

export async function generateMetadata({
  params
}: MatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const match = await findMatchById(id);

  if (!match) {
    return {
      title: "Jogo não encontrado | Bolão Copa 2026",
      description: "Não encontramos os dados deste jogo."
    };
  }

  const homeTeamName = getTeamName(match.homeTeamId);
  const awayTeamName = getTeamName(match.awayTeamId);
  const stadiumInfo = getStadiumInfo(match.stadiumId);
  const timezone = getStadiumTimezone(match.stadiumId);
  const matchTime = formatMatchTime(match.kickoffAt, timezone);
  const statusLabel = getMatchStatusLabel(match.status);
  const locationLabel = stadiumInfo
    ? `${stadiumInfo.name} · ${stadiumInfo.city}`
    : match.stadiumId;
  const scoreLabel =
    typeof match.score.home === "number" && typeof match.score.away === "number"
      ? `${homeTeamName} ${match.score.home} x ${match.score.away} ${awayTeamName}`
      : `${homeTeamName} x ${awayTeamName}`;

  const title = `${scoreLabel} | Bolão Copa 2026`;
  const description = `${statusLabel} · ${matchTime} · ${locationLabel}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description
    }
  };
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;
  const match = await findMatchById(id);

  if (!match) {
    return (
      <main className="page-shell">
        <section className="page-card space-y-4">
          <p className="page-kicker">Bolão Copa 2026</p>
          <h1 className="page-title">Jogo não encontrado</h1>
          <p className="page-copy">
            Não conseguimos localizar os dados deste jogo no momento.
          </p>
          <Link
            className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
            href="/grupos"
          >
            Voltar para grupos
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="w-full max-w-4xl space-y-6">
        <section className="page-card space-y-3">
          <p className="page-kicker">Bolão Copa 2026</p>
          <h1 className="page-title">Detalhe do Jogo</h1>
          <p className="page-copy">
            Acompanhe o confronto, horário e contexto desta partida.
          </p>
        </section>

        <MatchCard match={match} />

        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
            href="/grupos"
          >
            Voltar para grupos
          </Link>
          <Link
            className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
            href="/mata-mata"
          >
            Ver mata-mata
          </Link>
        </div>
      </div>
    </main>
  );
}
