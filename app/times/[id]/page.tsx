import type { Metadata } from "next";
import { TeamDetailClient } from "@/components/teams/TeamDetailClient";
import { getTeamName } from "@/lib/translations";

type TeamPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params
}: TeamPageProps): Promise<Metadata> {
  const { id } = await params;
  const teamName = getTeamName(id);

  return {
    title: `${teamName} - Copa 2026`,
    description: `Acompanhe posição, estatísticas e jogos de ${teamName} na Copa 2026.`
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { id } = await params;

  return <TeamDetailClient teamId={id} />;
}

