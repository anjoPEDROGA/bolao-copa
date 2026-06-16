"use client";

import { useEffect, useState } from "react";
import type { Match } from "@/types";
import { MatchCard } from "@/components/match/MatchCard";
import { DownloadMatchPdfButton } from "@/components/pdf/DownloadMatchPdfButton";

const mockMatch: Match = {
  id: "pdf-test-match",
  groupId: "group-a",
  stage: "group",
  homeTeamId: "brazil",
  awayTeamId: "argentina",
  stadiumId: "metlife-stadium",
  kickoffAt: "2026-06-14T20:00:00Z",
  status: "scheduled",
  score: {
    home: null,
    away: null
  },
  minute: null,
  lastUpdatedAt: null
};

export function MatchCardPdfTest() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Teste de PDF</h2>
        <p className="text-sm text-slate-300">
          Esta tela serve para validar a exportação com um layout branco próprio.
        </p>
        <p className="text-sm text-slate-400">
          O PDF usa layout branco próprio para maior estabilidade.
        </p>
      </div>

      <div className="inline-block">
        <MatchCard match={mockMatch} />
      </div>

      {isMounted ? (
        <DownloadMatchPdfButton match={mockMatch} />
      ) : (
        <button
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/70"
          type="button"
          disabled
        >
          Preparando PDF...
        </button>
      )}
    </section>
  );
}
