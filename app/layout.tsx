import type { Metadata } from "next";
import "./globals.css";
import { SWRProvider } from "@/components/providers/SWRProvider";
import { FallbackModeBanner } from "@/components/layout/FallbackModeBanner";
import { MainNav } from "@/components/layout/MainNav";

export const metadata: Metadata = {
  title: "Bolão Copa 2026",
  description: "App familiar para acompanhar a Copa do Mundo 2026."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <SWRProvider>
          <FallbackModeBanner />
          <MainNav />
          {children}
        </SWRProvider>
      </body>
    </html>
  );
}
