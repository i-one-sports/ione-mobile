import { Match } from "@/components/typings/match";
import { SessionSet } from "@/components/typings/apiResponse";

const idOf = (value: any): string | undefined =>
  typeof value === "string" ? value : value?._id;

/**
 * A team's player ids, whatever shape the match carries it in: populated with
 * player objects, populated with player ids, or just a team id (list and
 * create responses), which is looked up in the session's sets.
 */
export function teamPlayerIds(
  team: Match["teamOne"] | string | undefined | null,
  sets: SessionSet[],
): string[] {
  if (!team) return [];
  if (typeof team === "object") {
    const ids = (team.players ?? [])
      .map((p: any) => idOf(p))
      .filter(Boolean) as string[];
    if (ids.length > 0) return ids;
  }
  const set = sets.find((s) => s._id === idOf(team));
  return (set?.players ?? [])
    .map((p: any) => idOf(p))
    .filter(Boolean) as string[];
}

/**
 * Who runs the scoreboard of a game with no referee (the result is
 * UNOFFICIAL). The API lets any player of the two teams record it; the app
 * keeps one recorder: the captain when their team is playing. Only when the
 * captain's team sits out do the playing teams' players get it, since the
 * captain isn't allowed to record that game.
 */
export function canRunNoRefereeGame(
  playingIds: string[],
  captainId: string | undefined,
  userId: string | undefined,
): boolean {
  if (!userId || !playingIds.includes(userId)) return false;
  const captainPlaying = !!captainId && playingIds.includes(captainId);
  return captainPlaying ? userId === captainId : true;
}
