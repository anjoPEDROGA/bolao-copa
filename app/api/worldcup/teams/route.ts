import { NextResponse } from "next/server";
import { fetchRemoteWorldcupTeams } from "@/lib/api/worldcupRemote";

export async function GET() {
  try {
    const data = await fetchRemoteWorldcupTeams();
    return NextResponse.json({
      source: "proxy",
      data
    });
  } catch (error) {
    return NextResponse.json(
      {
        source: "empty",
        data: [],
        error: error instanceof Error ? error.message : "Failed to load teams"
      },
      { status: 200 }
    );
  }
}
