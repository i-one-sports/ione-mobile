import { Role } from "./apiResponse";

export interface Appointment {
  id: number;
  status: AppointmentStatus;
  salon: string;
  service: string;
  price: number;
  startTime: Date;
  clientName: string;
  clientImage: string;
  address: string;
}

export enum AppointmentStatus {
  pending = "PENDING",
  completed = "COMPLETED",
  canceled = "CANCELLED",
  confirmed = "CONFIRMED",
  no_show = "NO_SHOW",
  arrived = "ARRIVED",
  checked_in = "CHECKED_IN",
  checked_out = "CHECKED_OUT",
  in_service = "IN_SERVICE",
  paid = "PAID",
}

export interface Notification {
  id: number;
  userId: number;
  createdAt: Date;
  body: string;
  subject: string;
}

export interface Schedule {
  id: number;
  stylist: string;
  schedule_date: Date;
  start_time: string;
  closing_time: string;
  isAvailable: boolean;
  forHomeService: boolean;
  breaks: null | Break[];
}

export interface Break {
  id: number;
  break_date: string;
  start_time: string;
  closing_time: string;
  isAvailable: boolean;
  forHomeService: boolean;
}

export enum ScheduleStatus {
  open = "open",
  closed = "closed",
}

export interface PickerData {
  label: string;
  value: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface Team {
  _id: string;
  session: string;
  name: string;
  players: string[];
  __v: number;
  updatedAt?: string;
  initials?: string;
}
export type Service = "home_service" | "walk_in";

export interface User {
  id?: string;
  _id?: string;
  outletId?: number;
  businessName?: string | null;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  position?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  about?: string;
  website?: string;
  streetAddress1?: string;
  streetAddress2?: null | string;
  city?: string;
  countryId?: number;
  zipCode?: string;
  hasVerifiedEmail?: boolean;
  profilePhotoUrl?: string;
  state?: null | string;
  user?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
    token?: string;
    hasRegisteredProduct: boolean;
  };
  doesHomeService?: boolean;
  outlet?: Outlet;
  role?: Role; //changed from Role[] to role because of auth
  token?: string;
  isAdmin?: boolean;
  locationInfo?: {
    address?: string;
  };
  location?: {
    type: string;
    coordinates: [number, number];
  };
  dateOfBirth?: string;
  height?: number;
  placeOfBirth?: string;
  address?: string;
  isCaptain?: boolean;
  avatar?: string;
}

export interface Order {
  success: boolean;
  message: string;
}

export interface FormData {
  firstName?: string;
  lastName?: string;
  role?: string;
  email?: string;
  phone?: string;
  password?: string;
  repeatPassword?: string;
  clientType?: string;
  companyName?: string;
  product?: string;
  capacity?: string;
  price?: string;
  location?: string;
  image?: string;
  address?: string;
  position: string;
  nickName: string;
}

export type Outlet = {
  id: number;
  outletName: string;
  outletSlug: string;
  outletEmail: string;
  outletPhone: string;
  bankId: number | null;
  bankName: string | null;
  bankRoutingNumber: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
};

export interface Earning {
  id: number;
  status: AppointmentStatus;
  createdAt: Date;
  service: string;
  price: number;
  clientName: string;
}

export enum AccountType {
  new = "new_account",
  existing = "existing_account",
}

export type Account = {
  id: number;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountName: string;
};

export type UpdateState = "checking" | "available" | "downloading" | "reload";

export type Bank = {
  id: number;
  name: string;
};

export type BrandImage = {
  id: number;
  name: string;
  url: string;
  createdAt: string;
};

export type Player = {
  id: number;
  number: number;
  name: string;
  initials: string;
};

export type LineupData = {
  goalkeeper: Player[];
  defenders: Player[];
  midfielders: Player[];
  forwards: Player[];
};

export type Fixture = {
  id: string;
  time: string;
  teamA: string;
  teamAName: string;
  teamB: string;
  teamBName: string;
  type: string;
};

export interface TermsCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
  required?: boolean;
}
