import { NextResponse } from "next/server";
import { fetchRemoteWorldcupGames } from "@/lib/api/worldcupRemote";

export async function GET() {
  try {
    const matches = await fetchRemoteWorldcupGames();
    return NextResponse.json({
      source: "proxy",
      matches,
      data: matches
    });
  } catch (error) {
    return NextResponse.json(
      {
        source: "empty",
        matches: [],
        data: [],
        error: error instanceof Error ? error.message : "Failed to load games"
      },
      { status: 200 }
    );
  }
}
