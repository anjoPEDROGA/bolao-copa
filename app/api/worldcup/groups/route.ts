import { NextResponse } from "next/server";
import { staticGroups } from "@/lib/groups/staticGroups";
import {
  deriveGroupsFromWorldcupGames,
  fetchRemoteWorldcupGames,
  fetchRemoteWorldcupGroups
} from "@/lib/api/worldcupRemote";

export async function GET() {
  try {
    const groups = await fetchRemoteWorldcupGroups();
    if (groups.length > 0) {
      return NextResponse.json({
        source: "proxy",
        data: groups
      });
    }
  } catch {
    // derive from games below
  }

  try {
    const games = await fetchRemoteWorldcupGames();
    const groups = deriveGroupsFromWorldcupGames(games);
    if (groups.length > 0) {
      return NextResponse.json({
        source: "proxy",
        data: groups
      });
    }
  } catch {
    // static fallback below
  }

  return NextResponse.json({
    source: "fallback",
    data: staticGroups
  });
}
