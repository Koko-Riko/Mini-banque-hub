
import { API_ENDPOINTS, ApiResponse, ApiError } from './config';
import { Account, Transaction, Loan, Report } from '@/types/banking';
import { User } from '@/types/auth';
import { dbConfig } from '@/config/database';

/**
 * Service pour communiquer avec l'API PHP
 * Ce service va fonctionner comme une couche d'abstraction entre
 * notre application React et le backend PHP qui se connecte à MySQL
 */
export class ApiService {
  private async request<T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Pour envoyer les cookies avec la requête
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        let errorMessage = 'Une erreur est survenue';
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        }
        
        throw new ApiError(errorMessage, response.status);
      }
      
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json() as ApiResponse<T>;
        
        if (!result.success) {
          throw new ApiError(result.error || 'Erreur de traitement', 400);
        }
        
        return result.data as T;
      }
      
      throw new Error('Format de réponse non pris en charge');
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError((error as Error).message);
    }
  }

  // Méthodes d'authentification
  async login(username: string, password: string): Promise<User> {
    return this.request<User>(API_ENDPOINTS.LOGIN, 'POST', { username, password });
  }

  async logout(): Promise<void> {
    return this.request<void>(API_ENDPOINTS.LOGOUT, 'POST');
  }

  // Méthodes pour les comptes
  async getAccounts(): Promise<Account[]> {
    return this.request<Account[]>(API_ENDPOINTS.ACCOUNTS);
  }

  async getAccountById(id: string): Promise<Account> {
    return this.request<Account>(API_ENDPOINTS.ACCOUNT(id));
  }

  async createAccount(accountData: Omit<Account, "id" | "creationDate" | "lastActivity">): Promise<Account> {
    return this.request<Account>(API_ENDPOINTS.ACCOUNTS, 'POST', accountData);
  }

  async updateAccount(id: string, data: Partial<Account>): Promise<Account> {
    return this.request<Account>(API_ENDPOINTS.ACCOUNT(id), 'PUT', data);
  }

  async deleteAccount(id: string): Promise<boolean> {
    return this.request<boolean>(API_ENDPOINTS.ACCOUNT(id), 'DELETE');
  }

  // Méthodes pour les transactions
  async getTransactions(filters?: { accountId?: string }): Promise<Transaction[]> {
    const url = filters?.accountId 
      ? `${API_ENDPOINTS.TRANSACTIONS}?accountId=${filters.accountId}`
      : API_ENDPOINTS.TRANSACTIONS;
    
    return this.request<Transaction[]>(url);
  }

  async createTransaction(transactionData: Omit<Transaction, "id" | "date" | "performedBy">): Promise<Transaction> {
    return this.request<Transaction>(API_ENDPOINTS.TRANSACTIONS, 'POST', transactionData);
  }

  // Méthodes pour les prêts
  async getLoans(filters?: { accountId?: string }): Promise<Loan[]> {
    const url = filters?.accountId 
      ? `${API_ENDPOINTS.LOANS}?accountId=${filters.accountId}`
      : API_ENDPOINTS.LOANS;
    
    return this.request<Loan[]>(url);
  }

  async createLoan(loanData: Omit<Loan, "id" | "status" | "payments">): Promise<Loan> {
    return this.request<Loan>(API_ENDPOINTS.LOANS, 'POST', loanData);
  }

  // Méthodes pour les rapports
  async getReports(date?: string): Promise<Report[]> {
    const url = date 
      ? `${API_ENDPOINTS.REPORTS}?date=${date}`
      : API_ENDPOINTS.REPORTS;
    
    return this.request<Report[]>(url);
  }

  // Méthode pour obtenir les informations de configuration de la base de données
  // Utile pour le débogage et la configuration
  getDatabaseConfig() {
    return {
      host: dbConfig.host,
      database: dbConfig.database,
      port: dbConfig.port
    };
  }
}

// Création d'une instance unique du service pour l'application
export const apiService = new ApiService();
