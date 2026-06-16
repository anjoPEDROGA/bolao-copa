"use client";

import { useMemo } from "react";
import { Banner } from "@/components/ui/Banner";
import { MotionPage } from "@/components/ui/MotionPage";
import { MatchCardSkeleton } from "@/components/match/MatchCardSkeleton";
import { useGroupStandings } from "@/hooks/useGroupStandings";
import { buildTeamCatalog } from "@/lib/teams";
import { VALID_GROUP_IDS, normalizeGroupKey } from "@/lib/groups/groupIds";
import { TeamCard } from "./TeamCard";

function getGroupSortIndex(groupId: string): number {
  const normalizedGroupId = normalizeGroupKey(groupId);

  if (!normalizedGroupId) {
    return Number.MAX_SAFE_INTEGER;
  }

  const index = VALID_GROUP_IDS.indexOf(
    normalizedGroupId as (typeof VALID_GROUP_IDS)[number]
  );

  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function sortGroupIds(groupIds: string[]): string[] {
  return [...groupIds].sort((left, right) => {
    const leftIndex = getGroupSortIndex(left);
    const rightIndex = getGroupSortIndex(right);

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    return left.localeCompare(right, "pt-BR");
  });
}

export function TeamsPageClient() {
  const { groups, standingsByGroup, isLoading, isError, source, total } =
    useGroupStandings();

  const catalog = useMemo(
    () => buildTeamCatalog(groups, standingsByGroup),
    [groups, standingsByGroup]
  );

  const catalogByGroup = useMemo(() => {
    return catalog.reduce<Record<string, typeof catalog>>((accumulator, team) => {
      const current = accumulator[team.groupId] ?? [];
      accumulator[team.groupId] = [...current, team];
      return accumulator;
    }, {});
  }, [catalog]);

  const sortedGroupIds = useMemo(
    () => sortGroupIds(Object.keys(catalogByGroup)),
    [catalogByGroup]
  );

  const sourceLabel =
    source === "worldcup"
      ? "Fonte: API pública worldcup2026"
      : source === "proxy"
        ? "Fonte: proxy interno"
        : source === "fallback"
          ? "Fonte: fallback Firestore"
          : "Nenhum dado disponível no momento";

  return (
    <main className="page-shell">
      <MotionPage className="w-full max-w-6xl space-y-6">
        <section className="page-card space-y-3">
          <p className="page-kicker">Bolão Copa 2026</p>
          <h1 className="page-title text-3xl">Times</h1>
          <p className="page-copy text-sm">
            Selecione uma seleção para ver posição, estatísticas e jogos da Copa 2026.
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            {sourceLabel} · {total} jogos carregados
          </p>
        </section>

        {isError ? <Banner variant="danger">Não foi possível carregar as seleções agora.</Banner> : null}

        {isLoading ? (
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <MatchCardSkeleton />
            <MatchCardSkeleton />
            <MatchCardSkeleton />
          </section>
        ) : catalog.length === 0 ? (
          <Banner variant="warning">
            Nenhuma seleção disponível no momento.
          </Banner>
        ) : (
          <div className="space-y-5">
            {sortedGroupIds.map((groupId) => {
              const teams = catalogByGroup[groupId] ?? [];

              if (teams.length === 0) {
                return null;
              }

              const groupLabel = teams[0]?.groupLabel ?? groupId;

              return (
                <section
                  key={groupId}
                  className="space-y-3 rounded-2xl border border-white/10 bg-[#0f1727]/95 p-4"
                >
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-sky-300/80">
                        Seleções
                      </p>
                      <h2 className="text-lg font-semibold text-white">{groupLabel}</h2>
                    </div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      {teams.length} seleções
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {teams.map((team) => (
                      <TeamCard key={team.teamId} team={team} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </MotionPage>
    </main>
  );
}
