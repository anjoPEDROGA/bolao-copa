import type { Match } from "@/types";
import { fetchMatchesFromFallback, fetchWorldcupMatches } from "@/lib/api";

export async function findMatchById(id: string): Promise<Match | null> {
  try {
    const worldcupMatches = await fetchWorldcupMatches();
    const worldcupMatch = worldcupMatches.find((match) => match.id === id);
    if (worldcupMatch) {
      return worldcupMatch;
    }
  } catch {
    // Fallback below.
  }

  try {
    const fallbackMatches = await fetchMatchesFromFallback();
    return fallbackMatches.find((match) => match.id === id) ?? null;
  } catch {
    return null;
  }
}
