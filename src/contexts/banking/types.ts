
import { Account, Transaction, Loan, Report, TransactionType } from "@/types/banking";

export interface BankingContextType {
  accounts: Account[];
  transactions: Transaction[];
  loans: Loan[];
  reports: Report[];
  getAccountById: (id: string) => Account | undefined;
  createAccount: (accountData: Omit<Account, "id" | "creationDate" | "lastActivity">) => Promise<void>;
  createTransaction: (transactionData: Omit<Transaction, "id" | "date" | "performedBy">) => Promise<Transaction>;
  createLoan: (loanData: Omit<Loan, "id" | "status" | "payments">) => Promise<void>;
  getTransactionsByAccount: (accountId: string) => Transaction[];
  getLoansByAccount: (accountId: string) => Loan[];
  getReportByDate: (date: string) => Report | undefined;
  deleteAccount: (accountId: string) => Promise<void>;
  updateAccount: (accountId: string, updates: Partial<Account>) => Promise<void>;
}
