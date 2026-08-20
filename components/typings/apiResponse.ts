import { Team } from ".";

export interface Profile {
  id: number;
  jobTitle: null | string;
  businessName: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  streetAddress1: string;
  streetAddress2: null | string;
  city: string;
  countryId: number;
  zipCode: string;
  hasVerifiedEmail: boolean;
  profilePhotoUrl: string;
  state: null | string;
  country: {
    countryName: string;
    countryId: number;
    countryCode: string;
    countryDialCode: string;
  };
  doesHomeService: boolean;
  roles: string;
}

export enum Role {
  ADMIN = "admin", //changed 1 to admin because of authentication
  //   MANAGER = 2,
  //   STAFF = 3,
  USER = "user", //changed 4 to user because of authentication
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  id: string;
  first_name: string;
  last_name: string;
  nickname?: string;
  email: string;
  role?: Role;
  is_active: boolean;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
  token?: string;
  isAdmin?: boolean;
}

export interface UserResponse {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  address: string;
  phoneNumber: string;
  position?: string;
  isCaptain: boolean;
  isOwner: boolean;
  otpVerified: false;
  location: {
    type: string;
    coordinates: [number, number];
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  email: string;
  phone_number: string;
  user_id: string;
  email_verified: boolean;
  phone_verified: boolean;
  profile: object;
  ownerOnboardingStatus?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    token?: string;
    role?: Role;
    ownerOnboardingStatus?: string;
    hasRegisteredProduct: boolean;
  };
}

export interface SubmitVerificationResponse {
  message: string;
  verification: {
    _id: string;
    userId: string;
    idType: string;
    idNumber: string;
    address: string;
    frontUrl: string;
    backUrl: string;
    locationPictures: string[];
    status: string;
  };
}

export interface GetVerificationResponse {
  _id: string;
  userId: string;
  idType: string;
  idNumber: string;
  address: string;
  frontUrl: string;
  backUrl: string;
  locationPictures: string[];
  rejectionReason: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface BankResponse {
  _id: string;
  paystackId: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string;
  payWithBank: boolean;
  supportsTransfer: boolean;
  availableForDirectDebit: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
  isDeleted: boolean;
}

export interface forgotPasswordResponse {
  success: boolean;
  message: string;
}
export interface logoutResponse {
  success: boolean;
  message: string;
}

export interface ConfirmEmailResponse {
  success: boolean;
  message: string;
}

export interface SendEmailResponse {
  success: boolean;
  message: string;
}

export interface MatchSession {
  _id: string;
  session: string;
  teamOne?: Team;
  teamTwo?: Team;
  teamOneScore: number;
  teamTwoScore: number;
  initials?: string;
  matchType: string;
  isStarted: boolean;
  __v: number;
}

export interface AllSessionsResponse {
  pagination: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
  sessions: MatchSession[];
}
export interface WalletResponse {
  _id: string;
  balance: number;
  ledgerBalance: number;
  status: "ACTIVE" | "SUSPENDED" | "CLOSED";
  currency: string;
}

export interface DashboardSummary {
  pitchCondition: string;
  pitchPhoto: string;
  address: string;
  openingHour: string;
  closingHour: string;
}

export interface LocationResponse {
  _id: string;
  name: string;
  address: string;
  pitchPhoto?: string;
  friendly: boolean;
  tournament: boolean;
  tournamentFee: number;
  status: string;
  owner?: string;
  tier: "free" | "paid";
  pricingOption: "hourly" | "monthly";
  paymentPerPersonHourly?: number;
  paymentPerPersonMonthly?: number;
  openingHour?: string;
  closingHour?: string;
  location: { type: "Point"; coordinates: [number, number] };
  createdAt: string;
  updatedAt: string;
}

export interface VisitorResponse {
  visitorCount: number;
}

export interface UpcomingSession {
  _id: string;
  captain: string;
  createdAt: string;
  maxNumber: number;
  members: [];
  startTime: string;
  timeDuration: number;
}

export interface TeamPlayer {
  _id: string;
  name: string;
}
export interface Teamm {
  _id: string;
  name: string;
  session: string;
  createdAt: string;
  updatedAt: string;
  players: TeamPlayer[];
}
export interface LastMatch {
  _id: string;
  createdAt: string;
  isStarted: boolean;
  session: string;
  teamOne: Teamm;
  teamOneScore: number;
  teamTwo: Teamm;
  teamTwoScore: number;
}

export interface ChartData {
  month: number;
  year: number;
  count: number;
}

export interface UsersChart {
  total: number;
  data: ChartData[];
}

export interface Stats {
  total: number;
  count: number;
}

export interface RevenueStats {
  this_week: Stats;
  this_month: Stats;
  this_year: Stats;
}

export interface Player {
  _id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  avatar: string;
  position: string;
}

export interface RecentTeam {
  _id: string;
  name: string;
  players: Player[];
}

export interface GoalScorer {
  player: {
    _id: string;
    firstName: string;
    nickname: string;
  };
  team: "teamOne" | "teamTwo";
}
export interface MatchDetails {
  _id: string;
  teamOne: RecentTeam;
  teamTwo: RecentTeam;
  teamOneScore: number;
  teamTwoScore: number;
  isStarted: boolean;
  matchType: string;
  goalScorers: GoalScorer[];
}

export type PitchConditionType =
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "wet"
  | "under_maintenance";

export interface Location {
  _id: string;
  name: string;
  pitchCondition: PitchConditionType;
}

export interface UpdatePitchConditionResponse {
  message: string;
  location: Location;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface NotificationPayload {
  sessionId?: string;
  locationId?: string;
}

export interface Notification {
  targetUserId: string;
  type: string;
  title: string;
  body: string;
  payload?: NotificationPayload;
  timestamp: number;
}

export interface TransactionEntry {
  teamName: string;
  sessionId: string;
  setId: string;
  sessionStartTime: string;
  pricingOption: "hourly" | "monthly";
  paymentAmount: number;
  teamSize: number;
  membersPaid: number;
  totalPaid: number;
  expectedTotal: number;
  paymentStatus: "COMPLETE" | "PARTIAL" | "PENDING";
  paidAt: string;
}

export interface TransactionGroup {
  date: string;
  entries: TransactionEntry[];
}

export interface TransactionHistoryResponse {
  data: TransactionGroup[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type PricingTier = "free" | "paid";

export type PricingOptionType = "hourly" | "monthly";

export type PricingOptionPayload =
  | {
      tier: "free";
    }
  | {
      tier: "paid";
      pricingOption: "hourly";
      paymentPerPersonHourly: number;
    }
  | {
      tier: "paid";
      pricingOption: "monthly";
      paymentPerPersonMonthly: number;
    };

export interface UpdatePricingOptionsResponse {
  message: string;
  location: LocationResponse;
}

export interface SessionByDatePayload {
  locationId: string;
  date: string;
}

export type location = {
  _id: string;
  name: string;
  address: string;
};

export type captain = {
  _id: string;
  firstName: string;
  nickname: string;
};

export interface SessionByDateResponse {
  _id: string;
  location: location;
  captain: captain;
  members: [];
  startTime: string;
  stopTime: string;
  matchType: string;
  isFull: boolean;
  finished: boolean;
}

export interface Members {
  _id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  avatar: string | null;
  paymentStatus: "PAID" | "PENDING" | "FAILED" | "REFUNDED" | "NOT_REQUIRED";
}

export interface SessionByIdResponse {
  _id: string;
  paymentRequired: boolean;
  paymentAmount?: number;
  members: Members[];
  // full session fields
  captain?: {
    _id: string;
    firstName?: string;
    username?: string;
    nickname?: string;
  };
  location?: { _id: string; name: string; address: string };
  startTime?: string;
  stopTime?: string;
  matchType?: string;
  isFull?: boolean;
  finished?: boolean;
  inProgress?: boolean;
  maxNumber?: number;
  timeDuration?: number;
  minsPerSet?: number;
  winningDecider?: string;
  playersPerTeam?: number;
  setNumber?: number;
  status?: string;
}

export interface Tournament {
  _id: string;
  name: string;
  status: "registration" | "ongoing" | "completed";
  maxTeams: number;
  registeredTeams: string[];
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  prizeMoney: number;
  registrationFee: number;
  code: string;
  winner: string | null;
}

export type TournamentLocationResponse = Tournament[];

export interface CreateTournamentResponse {
  name: string;
}

export type TournamentStatus = "pending" | "started" | "completed" | string;

export type MatchSlot = "home" | "away";

export interface TournamentTeamRef {
  teamId: string;
  name: string;
  logo: string;
}

export interface TournamentMatch {
  matchIndex: number;
  round: number;
  roundName: string;
  home: TournamentTeamRef | null;
  away: TournamentTeamRef | null;
  homeScore: number | null;
  awayScore: number | null;
  winner: string | null;
  completed: boolean;
  scheduledTime: string | null;
  nextMatchIndex: number | null;
  nextMatchSlot: MatchSlot | null;
}

export interface RegisteredTeam {
  _id: string;
  name: string;
  logo: string;
  captain: string;
}

export interface Organizer {
  _id: string;
  firstName: string;
  lastName: string;
}

export interface TournamentDetailsResponse {
  _id: string;
  name: string;
  status: TournamentStatus;
  maxTeams: number;
  bracket: TournamentMatch[];
  registeredTeams: RegisteredTeam[];
  organizer: Organizer;
  startDate: string;
  winner: string | null;
}

export interface StartTournamentResponse {
  message: string;
  bracket: TournamentMatch[];
}

export interface UpdateOpenHoursResponse {
  message: string;
  location: {
    _id: string;
    name: string;
    openingHour: string;
    closingHour: string;
  };
}

export type TransactionType = "DEBIT" | "CREDIT" | "REFUNDED";

export type TransactionReason = "SESSION_PAYMENT";

export interface TransactionLedger {
  _id: string;
  walletId: string;
  transactionId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  reason: TransactionReason;
  createdAt: string;
}

export interface TransactionLedgerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TransactionLedgerResponse {
  entries: TransactionLedger[];
  pagination: TransactionLedgerPagination;
}

export interface TransactionListResponse {
  transactions: TransactionLedger[];
  pagination: TransactionLedgerPagination;
}
