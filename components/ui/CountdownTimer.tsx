"use client";

import { useEffect, useState } from "react";
import { getMatchCountdown } from "@/lib/datetime";

type CountdownTimerProps = {
  targetIsoDate: string;
  className?: string;
};

function formatCountdown(targetIsoDate: string): string {
  const countdown = getMatchCountdown(targetIsoDate);

  if (countdown.isPast) {
    return "Começando";
  }

  if (countdown.days > 0) {
    return `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m`;
  }

  return `${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`;
}

export function CountdownTimer({
  targetIsoDate,
  className = ""
}: CountdownTimerProps) {
  const [label, setLabel] = useState(() => formatCountdown(targetIsoDate));

  useEffect(() => {
    const update = () => {
      setLabel(formatCountdown(targetIsoDate));
    };

    update();
    const interval = window.setInterval(update, 1000);

    return () => window.clearInterval(interval);
  }, [targetIsoDate]);

  return <span className={className}>{label}</span>;
}
