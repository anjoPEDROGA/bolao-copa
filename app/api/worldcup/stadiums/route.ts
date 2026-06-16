import { NextResponse } from "next/server";
import { fetchRemoteWorldcupStadiums } from "@/lib/api/worldcupRemote";

export async function GET() {
  try {
    const data = await fetchRemoteWorldcupStadiums();
    return NextResponse.json({
      source: "proxy",
      data
    });
  } catch (error) {
    return NextResponse.json(
      {
        source: "empty",
        data: [],
        error: error instanceof Error ? error.message : "Failed to load stadiums"
      },
      { status: 200 }
    );
  }
}
