"use client";

import { useMemo, useState } from "react";
import { Banner } from "@/components/ui/Banner";
import { MotionPage } from "@/components/ui/MotionPage";
import { MatchCardSkeleton } from "@/components/match/MatchCardSkeleton";
import { MatchList } from "@/components/match/MatchList";
import { MatchFilters, type MatchFilter } from "@/components/filters/MatchFilters";
import { UserOnboarding } from "@/components/ui/UserOnboarding";
import { useUserProfile } from "@/hooks/useUserProfile";
import { compareIsoDateAsc, isSameUserLocalDay } from "@/lib/datetime";
import { GroupSection } from "@/components/groups/GroupSection";
import { useGroupStandings } from "@/hooks/useGroupStandings";

export function GroupsPageClient() {
  const [activeFilter, setActiveFilter] = useState<MatchFilter>("all");
  const { groups, standingsByGroup, matches, source, isLoading, isError } =
    useGroupStandings();
  const { profile } = useUserProfile();

  const counts = useMemo(() => {
    const today = matches.filter((match) => isSameUserLocalDay(match.kickoffAt));

    return {
      all: matches.length,
      today: today.length,
      live: matches.filter((match) => match.status === "live").length,
      finished: matches.filter((match) => match.status === "finished").length
    };
  }, [matches]);

  const filteredMatches = useMemo(() => {
    const ordered = [...matches].sort((left, right) =>
      compareIsoDateAsc(left.kickoffAt, right.kickoffAt)
    );

    switch (activeFilter) {
      case "today":
        return ordered.filter((match) => isSameUserLocalDay(match.kickoffAt));
      case "live":
        return ordered.filter((match) => match.status === "live");
      case "finished":
        return ordered.filter((match) => match.status === "finished");
      default:
        return ordered;
    }
  }, [activeFilter, matches]);

  const sourceLabel =
    source === "worldcup"
      ? "Fonte: API pública worldcup2026"
      : source === "proxy"
        ? "Fonte: proxy interno"
      : source === "fallback"
        ? "Fonte: fallback Firestore"
        : "Nenhum dado disponível no momento";

  const filteredGroups = useMemo(() => {
    if (filteredMatches.length === 0) {
      return groups;
    }

    const visibleGroupIds = new Set(
      filteredMatches
        .map((match) => match.groupId)
        .filter((groupId): groupId is string => typeof groupId === "string")
    );

    return groups.filter((group) => visibleGroupIds.has(group.id));
  }, [filteredMatches, groups]);

  return (
    <main className="page-shell">
      <MotionPage className="w-full max-w-5xl space-y-6">
        <section className="page-card space-y-3">
          <p className="page-kicker">Bolão Copa 2026</p>
          <h1 className="page-title">Fase de Grupos</h1>
          <p className="page-copy">
            Acompanhe os jogos, horários e favoritos da Copa 2026.
          </p>
        </section>

        <UserOnboarding />

        {isError ? (
          <Banner variant="danger">
            Não foi possível carregar os jogos agora.
          </Banner>
        ) : null}

        {!isLoading ? (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <MatchFilters
                activeFilter={activeFilter}
                counts={counts}
                onChange={setActiveFilter}
              />
              <div className="text-right text-xs uppercase tracking-[0.2em] text-slate-400">
                <p>{sourceLabel}</p>
                <p>
                  {matches.length} jogos · {groups.length} grupos
                </p>
              </div>
            </div>

            {filteredGroups.length > 0 ? (
              <div className="space-y-4">
                {filteredGroups.map((group) => (
                  <GroupSection
                    key={group.id}
                    favoriteTeamIds={profile.favoriteTeamIds}
                    group={group}
                    matches={filteredMatches}
                    standings={standingsByGroup[group.id] ?? []}
                  />
                ))}
              </div>
            ) : (
              <MatchList
                emptyMessage="Nenhum jogo encontrado para este filtro."
                favoriteTeamIds={profile.favoriteTeamIds}
                matches={filteredMatches}
              />
            )}
          </section>
        ) : (
          <section className="grid gap-4">
            <MatchCardSkeleton />
            <MatchCardSkeleton />
            <MatchCardSkeleton />
          </section>
        )}
      </MotionPage>
    </main>
  );
}
