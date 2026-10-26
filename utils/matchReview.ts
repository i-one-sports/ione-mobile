import { Match, RefereeEntry } from "@/components/typings/match";

/**
 * Who may confirm or dispute a Referee-mode result (PENDING_CONFIRMATION):
 * a player on the team opposing the captain whose phone recorded it; if that
 * captain's team wasn't in the game, a player from either team. Never that
 * captain, and only until reviewUntil.
 */
export function reviewInfo(
  match: Match | null | undefined,
  roster: RefereeEntry[],
  playersOf: (team: Match["teamOne"]) => string[],
  userId?: string,
) {
  const refereeEntry = roster.find((e) => e._id === match?.referee);
  // The captain whose phone was used (Referee mode).
  const deviceOwner = refereeEntry?.deviceOwner;
  const pending = Boolean(
    match?.status === "FINISHED" &&
    match.resultStatus === "PENDING_CONFIRMATION" &&
    (!match.reviewUntil || new Date(match.reviewUntil).getTime() > Date.now()),
  );

  if (!match || !pending || !userId || userId === deviceOwner) {
    return { pending, canRespond: false, refereeEntry, deviceOwner };
  }

  const teamOneIds = playersOf(match.teamOne);
  const teamTwoIds = playersOf(match.teamTwo);
  const canRespond = teamOneIds.includes(deviceOwner ?? "")
    ? teamTwoIds.includes(userId)
    : teamTwoIds.includes(deviceOwner ?? "")
      ? teamOneIds.includes(userId)
      : [...teamOneIds, ...teamTwoIds].includes(userId);

  return { pending, canRespond, refereeEntry, deviceOwner };
}
