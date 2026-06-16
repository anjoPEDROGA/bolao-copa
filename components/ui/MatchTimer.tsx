"use client";

import { useEffect, useState } from "react";
import { getElapsedMatchMinutes } from "@/lib/datetime";

type MatchTimerProps = {
  kickoffIsoDate: string;
  minute?: number | null;
  className?: string;
};

function resolveMinute(kickoffIsoDate: string, minute?: number | null): number {
  if (typeof minute === "number" && Number.isFinite(minute)) {
    return Math.max(0, Math.floor(minute));
  }

  return Math.max(0, getElapsedMatchMinutes(kickoffIsoDate));
}

export function MatchTimer({
  kickoffIsoDate,
  minute,
  className = ""
}: MatchTimerProps) {
  const [currentMinute, setCurrentMinute] = useState(() =>
    resolveMinute(kickoffIsoDate, minute)
  );

  useEffect(() => {
    const update = () => {
      setCurrentMinute(resolveMinute(kickoffIsoDate, minute));
    };

    update();
    const interval = window.setInterval(update, 30000);

    return () => window.clearInterval(interval);
  }, [kickoffIsoDate, minute]);

  return <span className={className}>{`${currentMinute}'`}</span>;
}
