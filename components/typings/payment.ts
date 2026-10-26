export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUND_PENDING"
  | "REFUND_NEEDS_ATTENTION"
  | "REFUND_FAILED"
  | "REFUNDED"
  | "EXPIRED";

// POOL: hourly sessions where members chip in toward one total.
// PER_PERSON: monthly and pre-pooling sessions with a fixed amount each.
export type PaymentMode = "POOL" | "PER_PERSON";

export interface PoolContributor {
  userId: string;
  name: string;
  amount: number;
}

/** Live state of a POOL session's pot. All amounts in kobo, before commission. */
export interface PoolSnapshot {
  sessionId: string;
  target: number;
  paid: number;
  reserved: number;
  remaining: number;
  /** remaining − reserved: the most anyone can start paying right now. */
  available: number;
  /** Suggestion only. */
  fairShare: number;
  /** Smallest allowed contribution, unless it exactly clears what's left. */
  minContribution: number;
  fullyFunded: boolean;
  contributors: PoolContributor[];
}

export interface InitPaymentResponse {
  authorizationUrl: string;
  reference: string;
  /** What Paystack charges (base + commission). */
  amount: number;
  // POOL only
  baseAmount?: number;
  commissionAmount?: number;
  expiresAt?: string;
  /** POOL: the pot was already full, no checkout was created. */
  alreadyPaid?: boolean;
  pool?: PoolSnapshot;
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

/** GET /wallet/session/:sessionId/payment-status */
export interface AllMembersPaymentStatus {
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  /** POOL: the pot is full. */
  allCompleted: boolean;
  payments: unknown[];
  /** POOL sessions only. */
  pool?: PoolSnapshot;
}

export interface WalletBalance {
  balance: number;
  ledgerBalance: number;
  currency: string;
  status?: string;
}

export interface WalletTransaction {
  _id: string;
  type: string;
  amount: number;
  status: "SUCCESS" | "FAILED" | "PENDING";
  reference: string;
  description: string;
  createdAt: string;
}

export interface WithdrawFundsResponse {
  authorizationUrl: string;
  reference: string;
  amount: number;
}

export interface BankAccountResponse {
  accountNumber: string;
  bankCode: string;
  bankName: string;
}

export interface Bank {
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

export type GetBanksResponse = Bank[];

export type TransactionType = "CREDIT" | "DEBIT" | "REFUNDED";

export type TransactionReason = "SESSION_PAYMENT" | string;

export interface LedgerEntry {
  _id: string;
  walletId: string;
  transactionId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  reason: TransactionReason;
  createdAt: string;
}

export interface LedgerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TransactionLedgerResponse {
  entries: LedgerEntry[];
  pagination: LedgerPagination;
}
