/* eslint-disable @typescript-eslint/no-empty-object-type */
import { AppDispatch } from "@/redux/store";

export type AsyncThunkConfig = {
  /** return type for `thunkApi.getState` */
  state?: unknown;
  /** type for `thunkApi.dispatch` */
  dispatch?: AppDispatch;
  /** type of the `extra` argument for the thunk middleware, which will be passed in as `thunkApi.extra` */
  extra?: unknown;
  /** type to be passed into `rejectWithValue`'s first argument that will end up on `rejectedAction.payload` */
  rejectValue: RejectValue;
  /** return type of the `serializeError` option callback */
  serializedErrorType?: unknown;
  /** type to be returned from the `getPendingMeta` option callback & merged into `pendingAction.meta` */
  pendingMeta?: unknown;
  /** type to be passed into the second argument of `fulfillWithValue` to finally be merged into `fulfilledAction.meta` */
  fulfilledMeta?: unknown;
  /** type to be passed into the second argument of `rejectWithValue` to finally be merged into `rejectedAction.meta` */
  rejectedMeta?: unknown;
};

export interface RejectValue {
  msg: string;
  status: number;
}

export enum Status {
  idle = "idle",
  pending = "pending",
  success = "success",
  failed = "failed",
}

export interface RegisterPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  location?: {};
  address?: string;
  position?: string;
  confirmPassword?: string;
  role?: string;
  clientType?: string;
  nickName?: string;
  isOwner?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}
export interface forgotPasswordPayload {
  password?: string;
  confirmPassword?: string;
  pin?: string;
  email?: string;
}
export interface verifyOtpPayload {
  email?: string;
  otp?: string;
}
export interface ErrorResponse {
  msg: string;
  status: number;
}
export interface sessionPayload {
  lat: number;
  lng: number;
}

export interface StartSessionRequest {
  locationId: string;
}

export type ImageFile = {
  uri: string;
  name: string;
  type: string;
  isImage?: boolean;
};

export interface SubmitVerificationPayload {
  idType: "BVN" | "NIN" | "DRIVERS_LICENSE" | "PASSPORT";
  idNumber: string;
  address: string;
  frontPage: ImageFile;
  backPage: ImageFile;
  locationPictures: ImageFile[];
}

export interface RegisterOwnerPayload {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    role: string;
  };
  location: {
    name: string;
    address: string;
    openingHour: string;
    closingHour: string;
    pitchMax: string;
    pitchSize: string;
    tier: string;
    pricingOption: string;
    paymentPerPersonHourly?: number;
    paymentPerPersonMonthly?: number;
    location: { coordinates: [number, number] };
  };
  payout: {
    bankCode: string;
    bankName: string;
    accountNumber: string;
  };
  termsAccepted: boolean;
  newsletterOptIn: boolean;
}

export interface CreateTournamentPayload {
  name: string;
}

export interface CreateTournamentTeamPayload {
  teamName: string;
  logo: string;
  captainId: string;
  playerIds: string[];
}
