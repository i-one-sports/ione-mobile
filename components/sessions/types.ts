export type Team = {
  initials: string;
  name: string;
  number?: string;
};

export type MatchTeams = {
  team1: Team;
  team2: Team;
  matchType: string;
};

export type Match = {
  sessionId: string;
  locationId?: string;

  captainName: string;
  locationName: string;
  matchType: string;

  time: string;
  minute: string;

  playerCount: number;
  maxPlayers: number;

  paymentRequired: boolean;
  paymentStatus?: string;
  paymentAmount: number;
  allPaymentsCompleted: boolean;

  inProgress: boolean;
  finished: boolean;
  isFull: boolean;
  joined: boolean;

  sessionData?: any;
};

export type TeamSchedule = {
  teamName: string;
  teamInitials: string;
  number?: string;
  matches: Match[];
};

export type DateItem = {
  id: number;
  dateNumber: string;
  dayName: string;
  isToday: boolean;
};

export type ExpandedState = Record<string, boolean>;

export type SessionTab = "all" | "tournaments" | "friendlies";

export interface ScheduleProps {
  initialTab?: SessionTab;
  title?: string;
}

export const TAB_ROUTE_MAP: Record<SessionTab, string | null> = {
  all: null,
  tournaments: "screens/newsession",
  friendlies: "screens/friendly",
  //   sets: "screens/set",
};
