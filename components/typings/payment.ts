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
  status?: string;
}

export interface WalletTransaction {
  _id: string;
  type: string;
  amount: number;
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
