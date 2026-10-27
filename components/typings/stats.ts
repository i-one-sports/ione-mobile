// Shapes of GET /stats/:userId and GET /stats/:userId/rating.

export interface PlayerStats {
  userId: string;
  /** null for all-time totals. */
  season: number | null;
  totalMatches: number;
  goals: number;
  assists: number;
  wins: number;
  draws: number;
  losses: number;
  /** Defenders only. */
  cleanSheets: number;
  playerOfSessionAwards: number;
}

export type RatingComponentKey =
  | "contribution"
  | "setWin"
  | "sessionWin"
  | "votes"
  | "experience";

export interface RatingComponent {
  key: RatingComponentKey;
  score: number;
  max: number;
}

export interface PlayerRating {
  userId: string;
  /** Out of 10; null until the player has a counted session. */
  rating: number | null;
  /** The last up-to-20 sessions the rating is worked out over. */
  window: { sessions: number; of: number };
  totals: {
    goals: number;
    assists: number;
    cleanSheets: number;
    gamesPlayed: number;
    gamesWon: number;
    /** 0–100 */
    setWinPct: number;
    sessionsWon: number;
    /** 0–100 */
    sessionWinPct: number;
    /** 0–100 */
    voteSharePct: number;
    votesCounted: number;
    contributionsPerSession: number;
  };
  components: RatingComponent[];
  playerOfSessionAwards: number;
}
