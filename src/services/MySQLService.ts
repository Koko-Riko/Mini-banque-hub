
import { DatabaseService } from "@/types/services";
import { Account, Transaction, Loan, Report } from "@/types/banking";
import { User } from "@/types/auth";

export class MySQLService implements DatabaseService {
  private accounts: Account[] = [];
  private transactions: Transaction[] = [];
  private loans: Loan[] = [];
  private reports: Report[] = [];

  // Auth methods
  async login(username: string, password: string): Promise<User | null> {
    // Cette méthode devrait faire une vraie requête à la base de données
    return null;
  }

  async logout(): Promise<void> {
    return Promise.resolve();
  }

  // Account methods
  async getAccounts(): Promise<Account[]> {
    return Promise.resolve([...this.accounts]);
  }

  async getAccountById(id: string): Promise<Account | null> {
    const account = this.accounts.find(a => a.id === id);
    return Promise.resolve(account || null);
  }

  async createAccount(accountData: Omit<Account, "id" | "creationDate" | "lastActivity">): Promise<Account> {
    const newAccount: Account = {
      ...accountData,
      id: `${this.accounts.length + 1}`,
      creationDate: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0],
    };
    
    this.accounts.push(newAccount);
    return Promise.resolve(newAccount);
  }

  async updateAccount(id: string, data: Partial<Account>): Promise<Account> {
    const index = this.accounts.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Account not found");
    
    this.accounts[index] = {
      ...this.accounts[index],
      ...data,
    };
    
    return Promise.resolve(this.accounts[index]);
  }

  async deleteAccount(id: string): Promise<boolean> {
    const initialLength = this.accounts.length;
    this.accounts = this.accounts.filter(a => a.id !== id);
    return Promise.resolve(this.accounts.length < initialLength);
  }

  // Transaction methods
  async getTransactions(filters?: { accountId?: string }): Promise<Transaction[]> {
    if (filters?.accountId) {
      return Promise.resolve(this.transactions.filter(t => t.accountId === filters.accountId));
    }
    return Promise.resolve([...this.transactions]);
  }

  async createTransaction(transactionData: Omit<Transaction, "id" | "date" | "performedBy">): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...transactionData,
      id: `${this.transactions.length + 1}`,
      date: new Date().toISOString(),
      performedBy: "1", // Serait l'ID de l'utilisateur connecté dans une vraie implémentation
    };
    
    this.transactions.push(newTransaction);
    
    // Mise à jour du solde du compte
    const accountIndex = this.accounts.findIndex(a => a.id === transactionData.accountId);
    if (accountIndex !== -1) {
      const account = this.accounts[accountIndex];
      let newBalance = account.balance;
      
      switch (transactionData.type) {
        case "deposit":
          newBalance += transactionData.amount;
          break;
        case "withdrawal":
        case "transfer":
          newBalance -= transactionData.amount;
          break;
      }
      
      this.accounts[accountIndex] = {
        ...account,
        balance: newBalance,
        lastActivity: new Date().toISOString().split('T')[0],
      };
    }
    
    return Promise.resolve(newTransaction);
  }

  // Loan methods
  async getLoans(filters?: { accountId?: string }): Promise<Loan[]> {
    if (filters?.accountId) {
      return Promise.resolve(this.loans.filter(l => l.accountId === filters.accountId));
    }
    return Promise.resolve([...this.loans]);
  }

  async createLoan(loanData: Omit<Loan, "id" | "status" | "payments">): Promise<Loan> {
    const newLoan: Loan = {
      ...loanData,
      id: `${this.loans.length + 1}`,
      status: "active",
      payments: [],
    };
    
    this.loans.push(newLoan);
    return Promise.resolve(newLoan);
  }

  // Report methods
  async getReports(date?: string): Promise<Report[]> {
    if (date) {
      return Promise.resolve(this.reports.filter(r => r.date === date));
    }
    return Promise.resolve([...this.reports]);
  }
}

// Instance unique du service pour l'application
export const mysqlService = new MySQLService();
