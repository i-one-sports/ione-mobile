export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUND_PENDING"
  | "REFUND_NEEDS_ATTENTION"
  | "REFUND_FAILED"
  | "REFUNDED";

export interface InitPaymentResponse {
  authorizationUrl: string;
  reference: string;
  amount: number;
}

export interface SessionPaymentStatus {
  status: PaymentStatus;
  amount: number;
  expiresAt: string;
}

export interface TournamentPaymentStatus {
  status: PaymentStatus;
  amount: number;
  paidAt: string | null;
}

export interface AllMembersPaymentStatus {
  total: number;
  paid: number;
  pending: number;
  allPaid: boolean;
}

export interface WalletBalance {
  balance: number;
  ledgerBalance: number;
  currency: string;
}

export interface WalletTransaction {
  _id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}
