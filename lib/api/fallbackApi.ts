import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import type { Group, Match } from "@/types";
import { db } from "@/lib/firebase/client";

function isValidMatch(value: unknown): value is Match {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.stage === "string" &&
    typeof record.homeTeamId === "string" &&
    typeof record.awayTeamId === "string" &&
    typeof record.stadiumId === "string" &&
    typeof record.kickoffAt === "string" &&
    typeof record.status === "string" &&
    typeof record.score === "object" &&
    record.score !== null
  );
}

function isValidGroup(value: unknown): value is Group {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    Array.isArray(record.teamIds)
  );
}

async function readCollection<T>(collectionName: string): Promise<T[]> {
  if (!db) {
    return [];
  }

  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map((documentSnapshot) => documentSnapshot.data() as T);
  } catch {
    return [];
  }
}

export async function fetchMatchesFromFallback(): Promise<Match[]> {
  const documents = await readCollection<unknown>("matches");
  return documents.filter(isValidMatch);
}

export async function fetchGroupsFromFallback(): Promise<Group[]> {
  const documents = await readCollection<unknown>("groups");
  return documents.filter(isValidGroup);
}

export async function fetchFallbackMode(): Promise<{
  isFallback: boolean;
  lastSync: string | null;
}> {
  if (!db) {
    return { isFallback: false, lastSync: null };
  }

  try {
    const fallbackDoc = await getDoc(doc(db, "system", "fallback"));
    if (!fallbackDoc.exists()) {
      return { isFallback: false, lastSync: null };
    }

    const data = fallbackDoc.data() as Record<string, unknown>;
    const isFallback = data.isFallback === true;
    const lastSync =
      typeof data.lastSync === "string" && data.lastSync.trim()
        ? data.lastSync.trim()
        : null;

    return { isFallback, lastSync };
  } catch {
    return { isFallback: false, lastSync: null };
  }
}
