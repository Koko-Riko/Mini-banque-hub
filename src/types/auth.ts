
export type UserRole = "admin" | "cashier";

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  branchId: string | null;
  isGeneralAdmin: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
