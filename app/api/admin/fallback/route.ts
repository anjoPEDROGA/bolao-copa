import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

type FallbackPayload = {
  isFallback?: boolean;
};

export async function GET() {
  const admin = adminDb;
  if (!admin) {
    return NextResponse.json(
      { error: "Firebase Admin is not configured" },
      { status: 500 }
    );
  }

  const snapshot = await admin.collection("system").doc("fallback").get();

  if (!snapshot.exists) {
    return NextResponse.json(
      {
        isFallback: false,
        lastSync: null
      },
      { status: 200 }
    );
  }

  const data = snapshot.data() as Record<string, unknown>;
  const isFallback = data.isFallback === true;
  const lastSync =
    typeof data.lastSync === "string" && data.lastSync.trim()
      ? data.lastSync.trim()
      : null;

  return NextResponse.json(
    {
      isFallback,
      lastSync
    },
    { status: 200 }
  );
}

export async function PATCH(request: Request) {
  const admin = adminDb;
  if (!admin) {
    return NextResponse.json(
      { error: "Firebase Admin is not configured" },
      { status: 500 }
    );
  }

  let payload: FallbackPayload;
  try {
    payload = (await request.json()) as FallbackPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (typeof payload.isFallback !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const lastSync = new Date().toISOString();

  try {
    // TODO: validate Firebase Auth ID token before allowing admin mutations.
    await admin.collection("system").doc("fallback").set(
      {
        isFallback: payload.isFallback,
        lastSync
      },
      { merge: true }
    );

    return NextResponse.json(
      {
        ok: true,
        isFallback: payload.isFallback,
        lastSync
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update fallback mode", error);
    return NextResponse.json(
      { error: "Failed to update fallback mode" },
      { status: 500 }
    );
  }
}
