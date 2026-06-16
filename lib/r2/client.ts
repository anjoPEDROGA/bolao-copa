export function getR2BaseUrl(): string {
  const rawBaseUrl = process.env.NEXT_PUBLIC_R2_URL ?? "";
  const trimmedBaseUrl = rawBaseUrl.trim();

  if (!trimmedBaseUrl) {
    return "";
  }

  return trimmedBaseUrl.replace(/\/+$/g, "");
}

export function joinR2Path(baseUrl: string, path: string): string {
  const trimmedBaseUrl = baseUrl.trim().replace(/\/+$/g, "");
  const trimmedPath = path.trim().replace(/^\/+/g, "");

  if (!trimmedBaseUrl) {
    return "";
  }

  if (!trimmedPath) {
    return trimmedBaseUrl;
  }

  return `${trimmedBaseUrl}/${trimmedPath}`;
}

export function getAssetUrl(path: string): string {
  const baseUrl = getR2BaseUrl();
  return joinR2Path(baseUrl, path);
}

function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function getFlagUrl(teamId: string): string {
  const normalizedTeamId = normalizeIdentifier(teamId);
  return getAssetUrl(`flags/${normalizedTeamId}.svg`);
}

export function getStadiumImageUrl(stadiumId: string): string {
  const normalizedStadiumId = normalizeIdentifier(stadiumId);
  return getAssetUrl(`stadiums/${normalizedStadiumId}.jpg`);
}
