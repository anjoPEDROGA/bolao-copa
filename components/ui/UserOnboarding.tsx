"use client";

import { getAvailableTeams, getTeamName } from "@/lib/translations";
import { useUserProfile } from "@/hooks/useUserProfile";

type UserOnboardingProps = {
  className?: string;
};

export function UserOnboarding({ className = "" }: UserOnboardingProps) {
  const {
    profile,
    setName,
    toggleFavoriteTeam,
    hasFavoriteTeam,
    isProfileReady
  } = useUserProfile();

  const availableTeams = getAvailableTeams();

  if (!isProfileReady) {
    return (
      <section
        className={`rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 ${className}`}
      >
        Carregando perfil...
      </section>
    );
  }

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-[#0f1727] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] ${className}`}
    >
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-300/90">
          Perfil local
        </p>
        <h2 className="text-xl font-semibold text-white">Seu torcedor</h2>
        <p className="text-sm text-slate-300">
          Perfil salvo localmente neste dispositivo.
        </p>
      </div>

      <div className="mt-6 space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Nome</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/50"
            onChange={(event) => setName(event.target.value)}
            placeholder="Digite seu nome"
            value={profile.name}
          />
        </label>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-slate-200">
              Seleções favoritas
            </p>
            <p className="text-xs text-slate-400">
              Toque para marcar os times preferidos.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableTeams.map((team) => {
              const selected = hasFavoriteTeam(team.id);

              return (
                <button
                  key={team.id}
                  className={`rounded-full border px-3 py-2 text-sm transition ${
                    selected
                      ? "border-sky-300/40 bg-sky-300/15 text-sky-100"
                      : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10"
                  }`}
                  onClick={() => toggleFavoriteTeam(team.id)}
                  type="button"
                >
                  {getTeamName(team.id)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
