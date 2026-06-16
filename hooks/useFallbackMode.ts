"use client";

import useSWR from "swr";
import { fetchFallbackMode } from "@/lib/api/fallbackApi";

type FallbackModeResult = {
  isFallback: boolean;
  lastSync: string | null;
};

export function useFallbackMode(): {
  isFallback: boolean;
  lastSync: string | null;
  isLoading: boolean;
  isError: boolean;
} {
  const { data, error, isLoading } = useSWR<FallbackModeResult>(
    "fallback-mode",
    fetchFallbackMode,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true
    }
  );

  return {
    isFallback: data?.isFallback ?? false,
    lastSync: data?.lastSync ?? null,
    isLoading,
    isError: Boolean(error)
  };
}
