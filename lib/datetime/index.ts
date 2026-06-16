import { differenceInSeconds, differenceInMinutes } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export function formatMatchTime(
  isoDate: string,
  stadiumTimezone: string
): string {
  try {
    const date = new Date(isoDate);

    if (Number.isNaN(date.getTime())) {
      return "Data indisponível";
    }

    return formatInTimeZone(date, stadiumTimezone || "UTC", "dd/MM/yyyy HH:mm");
  } catch {
    return "Data indisponível";
  }
}

export function getUserLocalNow(): Date {
  return new Date();
}

export function getMatchCountdown(
  targetIsoDate: string,
  now: Date = getUserLocalNow()
): {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
} {
  const targetDate = new Date(targetIsoDate);

  if (Number.isNaN(targetDate.getTime())) {
    return {
      totalSeconds: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true
    };
  }

  const totalSecondsRaw = differenceInSeconds(targetDate, now);
  const totalSeconds = Math.max(0, totalSecondsRaw);
  const isPast = totalSecondsRaw <= 0;
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    totalSeconds,
    days,
    hours,
    minutes,
    seconds,
    isPast
  };
}

export function getElapsedMatchMinutes(
  kickoffIsoDate: string,
  now: Date = getUserLocalNow()
): number {
  const kickoffDate = new Date(kickoffIsoDate);

  if (Number.isNaN(kickoffDate.getTime())) {
    return 0;
  }

  return Math.max(0, differenceInMinutes(now, kickoffDate));
}

export function isSameUserLocalDay(
  isoDate: string,
  now: Date = getUserLocalNow()
): boolean {
  try {
    const inputDate = new Date(isoDate);

    if (Number.isNaN(inputDate.getTime())) {
      return false;
    }

    return (
      inputDate.getFullYear() === now.getFullYear() &&
      inputDate.getMonth() === now.getMonth() &&
      inputDate.getDate() === now.getDate()
    );
  } catch {
    return false;
  }
}

export function formatShortTime(isoDate: string): string {
  try {
    const date = new Date(isoDate);

    if (Number.isNaN(date.getTime())) {
      return "--:--";
    }

    return formatInTimeZone(date, Intl.DateTimeFormat().resolvedOptions().timeZone, "HH:mm");
  } catch {
    return "--:--";
  }
}

export function compareIsoDateAsc(a: string, b: string): number {
  const left = Date.parse(a);
  const right = Date.parse(b);

  if (Number.isNaN(left) && Number.isNaN(right)) {
    return 0;
  }

  if (Number.isNaN(left)) {
    return 1;
  }

  if (Number.isNaN(right)) {
    return -1;
  }

  return left - right;
}
