import type { Match } from "@/types";
import { fetchMatchesFromFallback } from "@/lib/api";
import { fetchRemoteWorldcupGames } from "./worldcupRemote";

export async function findMatchById(id: string): Promise<Match | null> {
  try {
    const worldcupMatches = await fetchRemoteWorldcupGames();
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
