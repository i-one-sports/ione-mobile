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
  teams: MatchTeams;
  time: string;
  minute: string;
  team1score: number | string;
  team2score: number | string;
  joined: boolean;
  sessionData: any;
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

export type FixtureTab = "all" | "tournaments" | "friendlies" | "sets";

export const TAB_ROUTE_MAP: Record<FixtureTab, string | null> = {
  all: null,
  tournaments: "screens/newsession",
  friendlies: "screens/friendly",
  sets: "screens/set",
};
