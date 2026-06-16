"use client";

import { Banner } from "@/components/ui/Banner";
import { MotionPage } from "@/components/ui/MotionPage";
import { BracketTree } from "./BracketTree";
import { useBracket } from "@/hooks/useBracket";

export function BracketPageClient() {
  const { rounds, isLoading, isError } = useBracket();

  return (
    <main className="page-shell">
      <MotionPage className="w-full max-w-6xl space-y-6">
        <section className="page-card space-y-3">
          <p className="page-kicker">Bolão Copa 2026</p>
          <h1 className="page-title">Mata-mata</h1>
          <p className="page-copy">
            Acompanhe a estrutura inicial da fase eliminatória da Copa 2026.
          </p>
        </section>

        {isLoading ? (
          <Banner variant="info">Carregando chaveamento...</Banner>
        ) : null}

        {isError ? (
          <Banner variant="danger">Não foi possível carregar o mata-mata agora.</Banner>
        ) : null}

        <BracketTree rounds={rounds} />
      </MotionPage>
    </main>
  );
}
