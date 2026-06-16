"use client";

import { Banner } from "@/components/ui/Banner";
import { formatShortTime } from "@/lib/datetime";
import { useFallbackMode } from "@/hooks/useFallbackMode";

export function FallbackModeBanner() {
  const { isFallback, lastSync, isLoading, isError } = useFallbackMode();

  if (isLoading || isError || !isFallback) {
    return null;
  }

  const message = lastSync
    ? `Dados em modo offline — última atualização: ${formatShortTime(lastSync)}`
    : "Dados em modo offline — última atualização indisponível";

  return (
    <div className="sticky top-0 z-50">
      <Banner className="rounded-none border-x-0 border-t-0" variant="warning">
        {message}
      </Banner>
    </div>
  );
}
