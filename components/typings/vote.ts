// Shapes of GET/POST /votes/:sessionId (Player of the Session voting).

export interface VoteCandidateUser {
  _id: string;
  firstName: string;
  lastName?: string;
  nickname?: string;
  /** Profile position code, e.g. "ST", "MF", "DF", "GK". */
  position?: string;
}

export interface VoteCandidate {
  user: VoteCandidateUser;
  /** From this session's counted matches only. */
  goals: number;
  assists: number;
}

export interface VoteTally {
  candidate: string;
  votes: number;
  /** Share of votes cast, 0–100. */
  percent: number;
}

export interface VoteResult {
  /** NO_AWARD: turnout under minTurnout, or nobody voted. */
  outcome: "AWARDED" | "NO_AWARD";
  /** More than one on a tie. */
  winners: string[];
  votesCast: number;
  eligibleCount: number;
  /** e.g. 0.4 */
  minTurnout: number;
  /** Most votes first. */
  tallies: VoteTally[];
}

export interface SessionVote {
  sessionId: string;
  status: "OPEN" | "CLOSED";
  opensAt: string;
  closesAt: string;
  eligibleCount: number;
  votesCast: number;
  /** The candidate you voted for, or null. */
  myVote: string | null;
  /** Eligible, open, and not voted yet. */
  canVote: boolean;
  /** Every eligible player, including you. */
  candidates: VoteCandidate[];
  /** null until the result is counted (shortly after closesAt). */
  result: VoteResult | null;
}
