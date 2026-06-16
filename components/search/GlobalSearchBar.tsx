"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGroupStandings } from "@/hooks/useGroupStandings";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { buildTeamCatalog } from "@/lib/teams";
import { compareIsoDateAsc, formatMatchTime } from "@/lib/datetime";
import { getStadiumInfo, getStadiumTimezone, getTeamName } from "@/lib/translations";
import { VALID_GROUP_IDS, normalizeGroupKey } from "@/lib/groups/groupIds";
import type { Group, Match } from "@/types";

type SearchResultType = "teams" | "matches" | "groups";

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  type: SearchResultType;
  score: number;
  orderKey: string;
};

type SearchResultSections = Record<SearchResultType, SearchResult[]>;

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function scoreMatch(text: string, query: string): number {
  const normalizedText = normalizeSearchText(text);

  if (!normalizedText || !query) {
    return 0;
  }

  if (normalizedText === query) {
    return 100;
  }

  if (normalizedText.startsWith(query)) {
    return 90;
  }

  if (normalizedText.includes(query)) {
    return 60;
  }

  return 0;
}

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

function sortGroups(groups: Group[]): Group[] {
  return [...groups].sort((left, right) => {
    const leftIndex = getGroupSortIndex(left.id);
    const rightIndex = getGroupSortIndex(right.id);

    if (leftIndex !== rightIndex) {
      return leftIndex - rightIndex;
    }

    return left.name.localeCompare(right.name, "pt-BR");
  });
}

function buildMatchSearchText(match: Match): string {
  const stadiumInfo = getStadiumInfo(match.stadiumId);
  const homeTeamName = getTeamName(match.homeTeamId);
  const awayTeamName = getTeamName(match.awayTeamId);
  const stadiumName = stadiumInfo?.name ?? "";
  const stadiumCity = stadiumInfo?.city ?? "";
  const stadiumCountry = stadiumInfo?.country ?? "";
  const groupLabel = match.groupId ?? match.stage;

  return [
    homeTeamName,
    awayTeamName,
    `${homeTeamName} x ${awayTeamName}`,
    stadiumName,
    stadiumCity,
    stadiumCountry,
    match.stadiumId,
    groupLabel,
    match.stage,
    match.status
  ]
    .filter(Boolean)
    .join(" ");
}

export function GlobalSearchBar() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 250);

  const { groups, standingsByGroup, matches, isLoading } = useGroupStandings();

  const catalog = useMemo(
    () => buildTeamCatalog(groups, standingsByGroup),
    [groups, standingsByGroup]
  );

  const results = useMemo<SearchResultSections>(() => {
    const normalizedQuery = normalizeSearchText(debouncedQuery);

    if (!normalizedQuery) {
      return {
        teams: [],
        matches: [],
        groups: []
      };
    }

    const teamResults = catalog
      .reduce<SearchResult[]>((accumulator, team) => {
        const score = scoreMatch(
          `${team.teamName} ${team.groupLabel} ${team.groupId} ${team.teamId}`,
          normalizedQuery
        );

        if (score !== 0) {
          accumulator.push({
            id: team.teamId,
            title: team.teamName,
            subtitle: `${team.groupLabel} · ${team.position}º lugar`,
            href: `/times/${team.teamId}`,
            type: "teams" as const,
            score,
            orderKey: team.groupId
          });
        }

        return accumulator;
      }, [])
      .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title, "pt-BR"))
      .slice(0, 5);

    const matchResults = [...matches]
      .sort((left, right) => compareIsoDateAsc(left.kickoffAt, right.kickoffAt))
      .reduce<SearchResult[]>((accumulator, match) => {
        const homeTeamName = getTeamName(match.homeTeamId);
        const awayTeamName = getTeamName(match.awayTeamId);
        const stadiumInfo = getStadiumInfo(match.stadiumId);
        const stadiumLabel = stadiumInfo
          ? stadiumInfo.city
            ? `${stadiumInfo.name} · ${stadiumInfo.city}`
            : stadiumInfo.name
          : match.stadiumId;

        const score = scoreMatch(buildMatchSearchText(match), normalizedQuery);

        if (score !== 0) {
          accumulator.push({
            id: match.id,
            title: `${homeTeamName} x ${awayTeamName}`,
            subtitle: `${formatMatchTime(match.kickoffAt, getStadiumTimezone(match.stadiumId))} · ${stadiumLabel}`,
            href: `/jogo/${match.id}`,
            type: "matches" as const,
            score,
            orderKey: match.kickoffAt
          });
        }

        return accumulator;
      }, [])
      .sort((left, right) => right.score - left.score || compareIsoDateAsc(left.orderKey, right.orderKey))
      .slice(0, 5);

    const groupResults = sortGroups(groups)
      .reduce<SearchResult[]>((accumulator, group) => {
        const normalizedGroupId = normalizeGroupKey(group.id);
        const score = scoreMatch(`${group.name} ${group.id}`, normalizedQuery);

        if (score !== 0 && normalizedGroupId) {
          accumulator.push({
            id: group.id,
            title: group.name,
            subtitle: group.id.replace(/^group-/, "Grupo "),
            href: `/grupos#${group.id}`,
            type: "groups" as const,
            score,
            orderKey: group.id
          });
        }

        return accumulator;
      }, [])
      .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title, "pt-BR"))
      .slice(0, 5);

    return {
      teams: teamResults,
      matches: matchResults,
      groups: groupResults
    };
  }, [catalog, debouncedQuery, groups, matches]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent): void {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  const hasQuery = debouncedQuery.trim().length > 0;
  const totalResults =
    results.teams.length + results.matches.length + results.groups.length;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl">
      <label className="sr-only" htmlFor="global-search">
        Buscar seleções, jogos, grupos ou estádios
      </label>
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0f1727] px-3 py-2 text-sm text-slate-100 shadow-[0_14px_40px_rgba(0,0,0,0.18)]">
        <span className="text-slate-400" aria-hidden="true">
          ⌕
        </span>
        <input
          aria-controls="global-search-results"
          aria-autocomplete="list"
          autoComplete="off"
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          id="global-search"
          name="global-search"
          placeholder="Buscar seleção, grupo, estádio ou confronto"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <span className="hidden shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-400 sm:inline-flex">
          Busca
        </span>
      </div>

      {isOpen && hasQuery ? (
        <div
          id="global-search-results"
          className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1120] shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-sky-300/80">
                Resultados rápidos
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {isLoading ? "Carregando dados..." : `${totalResults} resultados encontrados`}
              </p>
            </div>
            <button
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/10"
              type="button"
              onClick={() => setIsOpen(false)}
            >
              Fechar
            </button>
          </div>

          <div className="max-h-[70vh] overflow-auto p-3">
            {(["teams", "matches", "groups"] as const).map((section) => {
              const sectionLabel =
                section === "teams" ? "Seleções" : section === "matches" ? "Jogos" : "Grupos";
              const sectionResults = results[section];

              return (
                <section key={section} className="space-y-2 rounded-2xl border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      {sectionLabel}
                    </h2>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
                      {sectionResults.length}
                    </span>
                  </div>

                  {sectionResults.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-white/10 px-3 py-3 text-sm text-slate-400">
                      Nenhum resultado nesta categoria.
                    </p>
                  ) : (
                    <div className="grid gap-2">
                      {sectionResults.map((result) => (
                        <Link
                          key={`${section}-${result.id}`}
                          className="group rounded-xl border border-white/10 bg-[#0f1727] px-3 py-2 transition hover:border-sky-300/25 hover:bg-white/[0.05]"
                          href={result.href}
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-white">
                                {result.title}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-slate-400">
                                {result.subtitle}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-400 transition group-hover:border-sky-300/25 group-hover:text-sky-100">
                              Abrir
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
