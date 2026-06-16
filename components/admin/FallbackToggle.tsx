"use client";

import { useEffect, useState } from "react";
import { formatShortTime } from "@/lib/datetime";

type FallbackState = {
  isFallback: boolean;
  lastSync: string | null;
};

type FallbackApiError = {
  error?: string;
};

function isFallbackState(value: unknown): value is FallbackState {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.isFallback === "boolean" &&
    ("lastSync" in record ? record.lastSync === null || typeof record.lastSync === "string" : true)
  );
}

function readErrorMessage(value: unknown, fallbackMessage: string): string {
  if (typeof value !== "object" || value === null) {
    return fallbackMessage;
  }

  const record = value as FallbackApiError;
  return typeof record.error === "string" ? record.error : fallbackMessage;
}

export function FallbackToggle() {
  const [state, setState] = useState<FallbackState>({
    isFallback: false,
    lastSync: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await fetch("/api/admin/fallback");
        const data: unknown = await response.json();

        if (!response.ok) {
          throw new Error(readErrorMessage(data, "Falha ao carregar fallback."));
        }

        if (!isFallbackState(data)) {
          throw new Error("Falha ao carregar fallback.");
        }

        if (mounted) {
          setState({
            isFallback: data.isFallback,
            lastSync: typeof data.lastSync === "string" ? data.lastSync : null
          });
        }
      } catch (error) {
        if (mounted) {
          setMessage(error instanceof Error ? error.message : "Falha ao carregar fallback.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleToggle() {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/fallback", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isFallback: !state.isFallback })
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        throw new Error(readErrorMessage(data, "Falha ao atualizar fallback."));
      }

      if (!isFallbackState(data) || typeof data.lastSync !== "string") {
        throw new Error("Falha ao atualizar fallback.");
      }

      setState({
        isFallback: data.isFallback,
        lastSync: data.lastSync
      });
      setMessage("Modo fallback atualizado.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao atualizar fallback.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-white/10 bg-[#0f1727] p-6 text-sm text-slate-300">
        Carregando modo fallback...
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0f1727] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Modo fallback</h3>
        <p className="text-sm text-slate-300">
          Estado atual:{" "}
          <span className={state.isFallback ? "text-amber-200" : "text-emerald-200"}>
            {state.isFallback ? "ativo" : "inativo"}
          </span>
        </p>
        <p className="text-sm text-slate-300">
          Última atualização: {state.lastSync ? formatShortTime(state.lastSync) : "indisponível"}
        </p>
      </div>

      {message ? <p className="mt-4 text-sm text-slate-300">{message}</p> : null}

      <button
        className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-60"
        disabled={isSaving}
        onClick={handleToggle}
        type="button"
      >
        {isSaving
          ? "Atualizando..."
          : state.isFallback
            ? "Desativar fallback"
            : "Ativar fallback"}
      </button>
    </section>
  );
}
