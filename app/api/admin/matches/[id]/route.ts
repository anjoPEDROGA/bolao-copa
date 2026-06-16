import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import type { MatchStatus, Score } from "@/types";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type MatchPatchPayload = {
  score?: Score;
  status?: MatchStatus;
  minute?: number | null;
};

const allowedStatuses: MatchStatus[] = [
  "scheduled",
  "live",
  "finished",
  "postponed",
  "cancelled"
];

function isMatchStatus(value: unknown): value is MatchStatus {
  return typeof value === "string" && allowedStatuses.includes(value as MatchStatus);
}

function isValidScore(value: unknown): value is Score {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;
  const home = record.home;
  const away = record.away;
  const homePenalty = record.homePenalty;
  const awayPenalty = record.awayPenalty;

  const isNullableNumber = (input: unknown): input is number | null =>
    input === null || (typeof input === "number" && Number.isFinite(input));

  return (
    isNullableNumber(home) &&
    isNullableNumber(away) &&
    (homePenalty === undefined || isNullableNumber(homePenalty)) &&
    (awayPenalty === undefined || isNullableNumber(awayPenalty))
  );
}

function isValidMinute(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value) && value >= 0);
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  const admin = adminDb;
  if (!admin) {
    return NextResponse.json(
      { error: "Firebase Admin is not configured" },
      { status: 500 }
    );
  }

  const { id } = await context.params;
  const matchSnapshot = await admin.collection("matches").doc(id).get();

  if (!matchSnapshot.exists) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  return NextResponse.json({ match: matchSnapshot.data() }, { status: 200 });
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const admin = adminDb;
  if (!admin) {
    return NextResponse.json(
      { error: "Firebase Admin is not configured" },
      { status: 500 }
    );
  }

  const { id } = await context.params;

  let payload: MatchPatchPayload;
  try {
    payload = (await request.json()) as MatchPatchPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const hasScore = Object.prototype.hasOwnProperty.call(payload, "score");
  const hasStatus = Object.prototype.hasOwnProperty.call(payload, "status");
  const hasMinute = Object.prototype.hasOwnProperty.call(payload, "minute");

  if (!hasScore && !hasStatus && !hasMinute) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {
    lastUpdatedAt: new Date().toISOString()
  };

  if (hasScore) {
    if (!isValidScore(payload.score)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    updateData.score = payload.score;
  }

  if (hasStatus) {
    if (!isMatchStatus(payload.status)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    updateData.status = payload.status;
  }

  if (hasMinute) {
    if (!isValidMinute(payload.minute)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    updateData.minute = payload.minute;
  }

  try {
    // TODO: validate Firebase Auth ID token before allowing admin mutations.
    await admin.collection("matches").doc(id).set(updateData, { merge: true });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to update match", error);
    return NextResponse.json(
      { error: "Failed to update match" },
      { status: 500 }
    );
  }
}
