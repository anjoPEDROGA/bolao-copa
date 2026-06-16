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
import { normalizeGroupKey } from "@/lib/groups/groupIds";

export function GroupsPageClient() {
  const [activeFilter, setActiveFilter] = useState<MatchFilter>("all");
  const {
    groups,
    standingsByGroup,
    groupMatches,
    source,
    total,
    groupTotal,
    knockoutTotal,
    isLoading,
    isError
  } =
    useGroupStandings();
  const { profile } = useUserProfile();
  const firstGroupId = groups[0]?.id ?? null;
  const firstGroupMatches = firstGroupId
    ? groupMatches.filter((match) => normalizeGroupKey(match.groupId) === normalizeGroupKey(firstGroupId))
    : [];

  const counts = useMemo(() => {
    const today = groupMatches.filter((match) => isSameUserLocalDay(match.kickoffAt));

    return {
      all: groupMatches.length,
      today: today.length,
      live: groupMatches.filter((match) => match.status === "live").length,
      finished: groupMatches.filter((match) => match.status === "finished").length
    };
  }, [groupMatches]);

  const visibleMatches = useMemo(() => {
    const ordered = [...groupMatches].sort((left, right) =>
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
  }, [activeFilter, groupMatches]);

  const sourceLabel =
    source === "worldcup"
      ? "Fonte: API pública worldcup2026"
      : source === "proxy"
        ? "Fonte: proxy interno"
      : source === "fallback"
        ? "Fonte: fallback Firestore"
        : "Nenhum dado disponível no momento";

  const filteredGroups = useMemo(() => {
    if (visibleMatches.length === 0) {
      return groups;
    }

    const visibleGroupKeys = new Set(
      visibleMatches
        .map((match) => normalizeGroupKey(match.groupId))
        .filter((key): key is string => key !== null)
    );

    return groups.filter((group) => {
      const key = normalizeGroupKey(group.id);
      return key !== null && visibleGroupKeys.has(key);
    });
  }, [groups, visibleMatches]);

  const matchesByGroupId = useMemo(() => {
    return groups.reduce<Record<string, typeof visibleMatches>>((accumulator, group) => {
      const normalizedGroupId = normalizeGroupKey(group.id);
      accumulator[group.id] = normalizedGroupId
        ? visibleMatches.filter(
            (match) => normalizeGroupKey(match.groupId) === normalizedGroupId
          )
        : [];
      return accumulator;
    }, {});
  }, [groups, visibleMatches]);

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
                {groupMatches.length} jogos de grupo · {groupTotal} calculados · {groups.length} grupos
              </p>
              <p>
                {total} jogos totais na API · {knockoutTotal} mata-mata
              </p>
              {process.env.NODE_ENV === "development" ? (
                <p>
                  debug: firstGroupId={firstGroupId ?? "-"} firstGroupMatches=
                  {firstGroupMatches.length}
                </p>
              ) : null}
            </div>
            </div>

            {filteredGroups.length > 0 ? (
              <div className="space-y-4">
                {filteredGroups.map((group) => (
                  <GroupSection
                    key={group.id}
                    favoriteTeamIds={profile.favoriteTeamIds}
                    group={group}
                    matches={matchesByGroupId[group.id] ?? []}
                    standings={standingsByGroup[group.id] ?? []}
                  />
                ))}
              </div>
            ) : (
              <MatchList
                emptyMessage="Nenhum jogo encontrado para este filtro."
                favoriteTeamIds={profile.favoriteTeamIds}
                matches={visibleMatches}
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
