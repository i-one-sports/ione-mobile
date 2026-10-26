import { router } from "expo-router";

interface PlayerLike {
  _id?: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  position?: string;
}

/**
 * Open a player's stats. The stats API returns numbers only, so the name and
 * position travel with the link.
 */
export function openPlayerStats(player?: PlayerLike | null) {
  if (!player?._id) return;
  const name =
    `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim() ||
    player.nickname ||
    "Player";
  router.push({
    pathname: "/stats",
    params: {
      userId: player._id,
      name,
      ...(player.position ? { position: player.position } : {}),
    },
  });
}
