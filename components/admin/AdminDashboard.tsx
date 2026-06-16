import { FallbackToggle } from "@/components/admin/FallbackToggle";
import { ScoreOverrideForm } from "@/components/admin/ScoreOverrideForm";

export function AdminDashboard() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Painel Admin</h1>
        <p className="text-sm text-slate-300">
          Controle manual de placares e modo fallback.
        </p>
      </div>

      <div className="grid gap-6">
        <ScoreOverrideForm />
        <FallbackToggle />
      </div>
    </section>
  );
}
