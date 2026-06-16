import type { Match } from "@/types";

export const REFRESH_INTERVAL_IDLE = 60000;
export const REFRESH_INTERVAL_LIVE = 20000;
export const REFRESH_INTERVAL_CRITICAL = 10000;

export function getRefreshInterval(matches?: Match[]): number {
  if (!matches || matches.length === 0) {
    return REFRESH_INTERVAL_IDLE;
  }

  const liveMatches = matches.filter((match) => match.status === "live");

  if (liveMatches.length === 0) {
    return REFRESH_INTERVAL_IDLE;
  }

  const hasCriticalLiveMatch = liveMatches.some(
    (match) => typeof match.minute === "number" && match.minute >= 89
  );

  if (hasCriticalLiveMatch) {
    return REFRESH_INTERVAL_CRITICAL;
  }

  return REFRESH_INTERVAL_LIVE;
}
