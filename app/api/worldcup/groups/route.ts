import { NextResponse } from "next/server";
import { staticGroups } from "@/lib/groups/staticGroups";
import {
  deriveGroupsFromWorldcupGames,
  fetchRemoteWorldcupGames
} from "@/lib/api/worldcupRemote";

// A API /get/groups retorna IDs MongoDB (hashes) que não casam com os groupIds
// dos jogos. Por isso derivamos os grupos diretamente dos jogos normalizados,
// que já têm groupId canônico ("group-a", "group-b"...).
export async function GET() {
  try {
    const games = await fetchRemoteWorldcupGames();
    const groups = deriveGroupsFromWorldcupGames(games);
    if (groups.length > 0) {
      return NextResponse.json({ source: "proxy", data: groups });
    }
  } catch {
    // static fallback below
  }

  return NextResponse.json({ source: "fallback", data: staticGroups });
}
