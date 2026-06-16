"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { MotionPage } from "@/components/ui/MotionPage";
import { auth, isFirebaseClientConfigured } from "@/lib/firebase/client";

export function AdminPageClient() {
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!auth || !isFirebaseClientConfigured) {
      setIsCheckingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsCheckingAuth(false);
    });

    return unsubscribe;
  }, []);

  if (!isFirebaseClientConfigured || !auth) {
    return (
      <main className="page-shell">
        <MotionPage className="w-full max-w-4xl space-y-6">
          <section className="page-card space-y-3">
            <p className="page-kicker">Bolão Copa 2026</p>
            <h1 className="page-title">Admin</h1>
            <p className="page-copy">Firebase Auth não está configurado.</p>
          </section>
          <AdminLogin />
        </MotionPage>
      </main>
    );
  }

  if (isCheckingAuth) {
    return (
      <main className="page-shell">
        <MotionPage className="w-full max-w-4xl space-y-6">
          <section className="page-card space-y-3">
            <p className="page-kicker">Bolão Copa 2026</p>
            <h1 className="page-title">Admin</h1>
            <p className="page-copy">Verificando sessão...</p>
          </section>
        </MotionPage>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <MotionPage className="w-full max-w-4xl space-y-6">
        <section className="page-card space-y-3">
          <p className="page-kicker">Bolão Copa 2026</p>
          <h1 className="page-title">Admin</h1>
          <p className="page-copy">Painel administrativo do Bolão Copa 2026.</p>
        </section>

        <AdminLogin />

        {user ? <AdminDashboard /> : null}
      </MotionPage>
    </main>
  );
}
