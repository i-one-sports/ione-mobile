// Shapes of the /matches and /referees endpoints (match day + referees).

export type TeamKey = "teamOne" | "teamTwo";

export type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED";

/** Set at full time. CONFIRMED and PENDING_CONFIRMATION count toward stats. */
export type ResultStatus =
  | "UNOFFICIAL"
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "DISPUTED";

export interface MatchPlayer {
  _id: string;
  firstName: string;
  lastName?: string;
  nickname?: string;
  position?: string;
}

/** Populated on GET /matches/details and recording responses. */
export interface MatchTeam {
  _id: string;
  name: string;
  players: MatchPlayer[];
}

export interface GoalScorerEntry {
  player: MatchPlayer;
  team: TeamKey;
  assistedBy?: MatchPlayer | string;
  eventId?: string;
  /** Referee roster entry id. */
  recordedBy?: string;
  recordedAt?: string;
}

export interface MatchEvent {
  eventId: string;
  type: "GOAL" | "UNDO";
  team: TeamKey;
  scorer?: string;
  assistedBy?: string;
  /** For UNDO: the eventId of the goal it cancelled. */
  undoes?: string;
  recordedByUser: string;
  referee: string | null;
  at: string;
}

export interface Match {
  _id: string;
  session?: string;
  /** A team id on list responses, populated on details/recording responses. */
  teamOne: MatchTeam | string;
  teamTwo: MatchTeam | string;
  teamOneScore: number;
  teamTwoScore: number;
  status: MatchStatus;
  /** Deprecated: equal to status === "LIVE". Use `status`. */
  isStarted?: boolean;
  /** Game number within the session (1, 2, 3…). */
  sequence: number;
  /** Team ids not playing this game, front of the queue first. */
  waiting?: string[];
  startedAt?: string;
  endedAt?: string;
  /** Team id, or null for a draw. */
  winner?: string | null;
  decidedBy?: "NORMAL_TIME" | "PENALTIES" | "DRAW";
  penaltyWinner?: TeamKey;
  /** Current referee's roster entry id, or null. */
  referee: string | null;
  refereeHistory?: { referee: string | null; at: string; by: string }[];
  resultStatus?: ResultStatus;
  /** PENDING_CONFIRMATION only: end of the dispute window. */
  reviewUntil?: string;
  statsPostedAt?: string;
  /** Goes up by 1 on every goal and undo; sent back as expectedScoreVersion. */
  scoreVersion: number;
  events?: MatchEvent[];
  goalScorers: GoalScorerEntry[];
  confirmedBy?: string;
  confirmedAt?: string;
  matchType?: string;
}

export interface StartMatchResponse {
  message: string;
  match: Match;
}

export interface EndMatchResponse {
  message: string;
  match: Match;
  /** The next game (SCHEDULED), or null when time is up. */
  next: Match | null;
}

// ── Referees ──

export type RefereeMode = "OWN_PHONE" | "CAPTAIN_DEVICE";
export type RefereeStatus = "INVITED" | "ACCEPTED" | "DECLINED";

export interface RefereeEntry {
  _id: string;
  session: string;
  /** Populated on GET /referees/:sessionId; an id elsewhere. Missing for a guest with no account. */
  user?: MatchPlayer | string;
  /** CAPTAIN_DEVICE only. */
  guestName?: string;
  mode: RefereeMode;
  /** CAPTAIN_DEVICE only: the captain whose phone is used. */
  deviceOwner?: string;
  status: RefereeStatus;
  invitedBy: string;
  respondedAt?: string;
}

export interface RefereeHistory {
  userId: string;
  refereedSessions: number;
}
