"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/grupos", label: "Grupos" },
  { href: "/mata-mata", label: "Mata-mata" },
  { href: "/pdf-test", label: "PDF Teste" },
  { href: "/admin", label: "Admin" }
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-white/10 bg-[#0b1120]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-sky-300/15 text-sky-100 ring-1 ring-sky-300/25"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
              href={item.href}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
