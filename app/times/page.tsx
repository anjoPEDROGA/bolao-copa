import type { Metadata } from "next";
import { TeamsPageClient } from "@/components/teams/TeamsPageClient";

export const metadata: Metadata = {
  title: "Times | Bolão Copa 2026",
  description: "Catálogo de seleções da Copa 2026."
};

export default function TeamsPage() {
  return <TeamsPageClient />;
}

