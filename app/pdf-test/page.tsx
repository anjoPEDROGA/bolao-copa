import { MatchCardPdfTest } from "@/components/pdf/MatchCardPdfTest";

export default function PdfTestPage() {
  return (
    <main className="page-shell">
      <div className="w-full max-w-4xl space-y-6">
        <section className="page-card space-y-3">
          <p className="page-kicker">Bolão Copa 2026</p>
          <h1 className="page-title">Teste de PDF</h1>
          <p className="page-copy">
            Página de validação manual da exportação de um card para PDF.
          </p>
        </section>

        <MatchCardPdfTest />
      </div>
    </main>
  );
}
