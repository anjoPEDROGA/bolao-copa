"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";

type SWRProviderProps = {
  children: ReactNode;
};

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: true,
        shouldRetryOnError: true,
        errorRetryCount: 2,
        dedupingInterval: 10000
      }}
    >
      {children}
    </SWRConfig>
  );
}
