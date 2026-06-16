import type { ReactNode } from "react";

type BannerVariant = "info" | "success" | "warning" | "danger";

type BannerProps = {
  children: ReactNode;
  variant?: BannerVariant;
  className?: string;
};

const variantClasses: Record<BannerVariant, string> = {
  info: "border-sky-400/20 bg-sky-400/10 text-sky-100",
  success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  warning: "border-amber-400/20 bg-amber-400/10 text-amber-100",
  danger: "border-rose-400/20 bg-rose-400/10 text-rose-100"
};

export function Banner({
  children,
  variant = "info",
  className = ""
}: BannerProps) {
  return (
    <div
      className={`flex items-center rounded-2xl border px-4 py-3 text-sm ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
