"use client";

import { useMemo } from "react";
import { generateBracketFromStandings } from "@/lib/classification/bracket";
import { useGroupStandings } from "@/hooks/useGroupStandings";
import type { BracketRound } from "@/types";

export function useBracket(): {
  rounds: BracketRound[];
  isLoading: boolean;
  isError: boolean;
} {
  const { standingsByGroup, isLoading, isError } = useGroupStandings();

  const rounds = useMemo(
    () => generateBracketFromStandings(standingsByGroup),
    [standingsByGroup]
  );

  return {
    rounds,
    isLoading,
    isError
  };
}
