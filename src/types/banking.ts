export type TransactionType = "deposit" | "withdrawal" | "transfer" | "loan_payment" | "interest";
export type AccountType = "Compte Epargne" | "Compte Courant" | "Compte d'investissement";
export type AccountStatus = "active" | "inactive" | "suspended" | "closed";
export type LoanStatus = "active" | "paid" | "overdue" | "pending" | "completed" | "defaulted";

export interface Account {
  id: string;
  clientName: string;
  accountNumber: string;
  balance: number;
  creationDate: string;
  lastActivity: string;
  accountType?: AccountType;
  status?: AccountStatus;
  
  // Personal information
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  birthPlace?: string;
  gender?: string;
  
  // Contact
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  
  // Document
  documentType?: string;
  documentNumber?: string;
  documents?: {
    passport: boolean;
    idCard: boolean;
    drivingLicense: boolean;
    documentNumber: string;
  };
  
  // Other
  activity?: string;
  initialDeposit?: number;
  currency?: string;
  photoUrl?: string;
  photo?: string;
  device?: string;
  signature?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  accountId: string;
  description?: string;
  performedBy: string;
  destinationAccountId?: string;
}

export interface Loan {
  id: string;
  accountId: string;
  clientName: string;
  amount: number;
  interestRate: number;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  nextPaymentDate?: string;
  durationMonths?: number;
  monthlyPayment?: number;
  totalAmount?: number;
  remainingAmount?: number;
  status: LoanStatus;
  payments: LoanPayment[];
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  status: "paid" | "pending";
}

export interface Report {
  id?: string;
  date: string;
  totalTransactions?: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalTransfers: number;
  totalLoanPayments?: number;
  activeAccounts?: number;
  newAccounts: number;
  newLoans?: number;
  totalLoans?: number;
}
