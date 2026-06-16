import { getFlagUrl } from "@/lib/r2/client";

type FlagIconProps = {
  teamId: string;
  alt?: string;
  size?: number;
  className?: string;
};

function getInitials(teamId: string): string {
  const cleaned = teamId.trim();

  if (!cleaned) {
    return "?";
  }

  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function FlagIcon({
  teamId,
  alt,
  size = 28,
  className = ""
}: FlagIconProps) {
  const src = getFlagUrl(teamId);
  const fallbackLabel = alt ?? `Bandeira de ${teamId}`;
  const initials = getInitials(teamId);

  if (!src) {
    return (
      <span
        aria-label={fallbackLabel}
        className={`inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-[0.65rem] font-semibold text-white/80 ${className}`}
        style={{ width: size, height: size }}
      >
        {initials}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={fallbackLabel}
      className={`inline-block object-cover ${className}`}
      height={size}
      loading="lazy"
      src={src}
      width={size}
    />
  );
}
