"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import type { Match } from "@/types";
import { MatchPdfDocument } from "@/components/pdf/MatchPdfDocument";

type DownloadMatchPdfButtonProps = {
  match: Match;
  fileName?: string;
};

export function DownloadMatchPdfButton({
  match,
  fileName = "bolao-copa-card-teste.pdf"
}: DownloadMatchPdfButtonProps) {
  return (
    <PDFDownloadLink
      document={<MatchPdfDocument match={match} />}
      fileName={fileName}
      className="inline-flex rounded-xl border border-sky-300/20 bg-sky-300/10 px-4 py-3 text-sm font-medium text-sky-50 transition hover:bg-sky-300/15"
    >
      {({ loading }) => (loading ? "Preparando PDF..." : "Baixar PDF de teste")}
    </PDFDownloadLink>
  );
}
