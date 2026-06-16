// Chaves canônicas da fase de grupos.

export const VALID_GROUP_IDS = [
  "group-a",
  "group-b",
  "group-c",
  "group-d",
  "group-e",
  "group-f",
  "group-g",
  "group-h",
  "group-i",
  "group-j",
  "group-k",
  "group-l"
] as const;

const validGroupKeySet = new Set<string>(VALID_GROUP_IDS);

function normalizeRawGroupKey(value: string): string {
  return value.trim().toLowerCase().replace(/^grupo\s+/, "group-").replace(/\s+/g, "-");
}

export function normalizeGroupKey(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = normalizeRawGroupKey(value)
    .replace(/^group-/, "")
    .replace(/^grupo-/, "");

  if (/^[a-l]$/.test(normalized)) {
    return `group-${normalized}`;
  }

  if (validGroupKeySet.has(normalized)) {
    return normalized;
  }

  return null;
}

export function isValidGroupId(value: string | null | undefined): boolean {
  return normalizeGroupKey(value) !== null;
}
