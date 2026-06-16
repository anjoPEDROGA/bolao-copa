"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User
} from "firebase/auth";
import { auth, isFirebaseClientConfigured } from "@/lib/firebase/client";

type AdminLoginProps = {
  onAuthenticated?: () => void;
};

export function AdminLogin({ onAuthenticated }: AdminLoginProps) {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth || !isFirebaseClientConfigured) {
      setIsCheckingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsCheckingAuth(false);
      if (currentUser) {
        onAuthenticated?.();
      }
    });

    return unsubscribe;
  }, [onAuthenticated]);

  const title = useMemo(() => {
    if (!isFirebaseClientConfigured || !auth) {
      return "Firebase Auth não está configurado.";
    }

    return user ? "Sessão ativa" : "Entrar no painel";
  }, [user]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!auth) {
      setError("Firebase Auth não está configurado.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      setUser(credential.user);
      onAuthenticated?.();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Falha ao entrar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    if (!auth) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await signOut(auth);
      setUser(null);
    } catch {
      setError("Falha ao sair.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isFirebaseClientConfigured || !auth) {
    return (
      <section className="rounded-3xl border border-white/10 bg-[#0f1727] p-6 text-sm text-slate-300">
        Firebase Auth não está configurado.
      </section>
    );
  }

  if (isCheckingAuth) {
    return (
      <section className="rounded-3xl border border-white/10 bg-[#0f1727] p-6 text-sm text-slate-300">
        Verificando sessão...
      </section>
    );
  }

  if (user) {
    return (
      <section className="rounded-3xl border border-white/10 bg-[#0f1727] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300/80">
              Admin
            </p>
            <h2 className="text-xl font-semibold text-white">Sessão ativa</h2>
            <p className="mt-1 text-sm text-slate-300">{user.email}</p>
          </div>

          <button
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-60"
            disabled={isSubmitting}
            onClick={handleLogout}
            type="button"
          >
            Sair
          </button>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-200">{error}</p> : null}
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-[#0f1727] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-300/80">
          Admin
        </p>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="text-sm text-slate-300">
          Entre com email e senha para acessar o painel.
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleLogin}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Email</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/50"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-200">Senha</span>
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/50"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>

        {error ? <p className="text-sm text-rose-200">{error}</p> : null}

        <button
          className="w-full rounded-xl border border-sky-300/20 bg-sky-300/10 px-4 py-3 text-sm font-medium text-sky-50 transition hover:bg-sky-300/15 disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </section>
  );
}
