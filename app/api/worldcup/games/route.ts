import { NextResponse } from "next/server";
import { fetchRemoteWorldcupGames } from "@/lib/api/worldcupRemote";
import { isGroupStageMatch } from "@/lib/api/normalizers";

export async function GET() {
  try {
    const matches = await fetchRemoteWorldcupGames();
    const total = matches.length;
    const groupTotal = matches.filter((match) => isGroupStageMatch(match)).length;
    const knockoutTotal = Math.max(0, total - groupTotal);

    return NextResponse.json({
      source: "proxy",
      matches,
      data: matches,
      total,
      groupTotal,
      knockoutTotal
    });
  } catch (error) {
    return NextResponse.json(
      {
        source: "empty",
        matches: [],
        data: [],
        total: 0,
        groupTotal: 0,
        knockoutTotal: 0,
        error: error instanceof Error ? error.message : "Failed to load games"
      },
      { status: 200 }
    );
  }
}
