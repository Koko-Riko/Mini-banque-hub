
import { Account, Transaction, Loan, Report } from "./banking";
import { User } from "./auth";

export interface DatabaseService {
  // Authentication
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  
  // Accounts
  getAccounts: () => Promise<Account[]>;
  getAccountById: (id: string) => Promise<Account | null>;
  createAccount: (accountData: Omit<Account, "id" | "creationDate" | "lastActivity">) => Promise<Account>;
  updateAccount: (id: string, data: Partial<Account>) => Promise<Account>;
  deleteAccount: (id: string) => Promise<boolean>;

  // Transactions
  getTransactions: (filters?: { accountId?: string }) => Promise<Transaction[]>;
  createTransaction: (transactionData: Omit<Transaction, "id" | "date" | "performedBy">) => Promise<Transaction>;

  // Loans
  getLoans: (filters?: { accountId?: string }) => Promise<Loan[]>;
  createLoan: (loanData: Omit<Loan, "id" | "status" | "payments">) => Promise<Loan>;
  
  // Reports
  getReports: (date?: string) => Promise<Report[]>;
}
