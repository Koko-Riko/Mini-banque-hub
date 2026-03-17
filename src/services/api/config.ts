
/**
 * Configuration pour les appels API vers le backend PHP
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/auth/login.php`,
  LOGOUT: `${API_BASE_URL}/auth/logout.php`,
  
  // Accounts
  ACCOUNTS: `${API_BASE_URL}/accounts/index.php`,
  ACCOUNT: (id: string) => `${API_BASE_URL}/accounts/account.php?id=${id}`,
  
  // Transactions
  TRANSACTIONS: `${API_BASE_URL}/transactions/index.php`,
  
  // Loans
  LOANS: `${API_BASE_URL}/loans/index.php`,
  
  // Reports
  REPORTS: `${API_BASE_URL}/reports/index.php`,
};

/**
 * Format des réponses API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Gestion des erreurs API
 */
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
