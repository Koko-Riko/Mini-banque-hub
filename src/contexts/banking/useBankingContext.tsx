
import React, { createContext, useContext, useState, useEffect } from "react";
import { Account, Transaction, Loan, Report } from "@/types/banking";
import { toast } from "sonner";
import { useAuth } from "../AuthContext";
import { BankingContextType } from "./types";
import { getTransactionTypeLabel } from "./utils";
import { supabaseService } from "@/services/supabaseService";
import { updateReportForTransaction, updateReportForNewLoan } from "./reportUtils";

const BankingContext = createContext<BankingContextType | undefined>(undefined);

export const BankingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadAllData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);


  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [accountsData, transactionsData, loansData, reportsData] = await Promise.all([
        supabaseService.getAccounts(),
        supabaseService.getTransactions(),
        supabaseService.getLoans(),
        supabaseService.getReports(),
      ]);
      
      setAccounts(accountsData);
      setTransactions(transactionsData);
      setLoans(loansData);
      setReports(reportsData);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  const getAccountById = (id: string) => {
    return accounts.find(account => account.id === id);
  };

  const createAccount = async (accountData: Omit<Account, "id" | "creationDate" | "lastActivity">) => {
    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    try {
      const newAccount = await supabaseService.createAccount(accountData, user.id);
      setAccounts([newAccount, ...accounts]);
      toast.success(`Compte créé pour ${accountData.clientName || newAccount.clientName}`);
      
      // Reload data to ensure consistency
      await loadAllData();
    } catch (error: any) {
      console.error("Error creating account:", error);
      toast.error("Erreur lors de la création du compte");
      throw error;
    }
  };

  const createTransaction = async (transactionData: Omit<Transaction, "id" | "date" | "performedBy">) => {
    if (!user) {
      toast.error("Vous devez être connecté pour effectuer cette opération");
      throw new Error("Utilisateur non authentifié");
    }

    const account = accounts.find(a => a.id === transactionData.accountId);
    
    if (!account) {
      toast.error("Compte introuvable");
      throw new Error("Compte introuvable");
    }

    // Verify sufficient funds for withdrawals and transfers
    if (transactionData.type !== "deposit" && account.balance < transactionData.amount) {
      toast.error("Fonds insuffisants");
      throw new Error("Fonds insuffisants");
    }

    let balanceAfter = account.balance;
    switch (transactionData.type) {
      case "deposit":
        balanceAfter += transactionData.amount;
        break;
      case "withdrawal":
      case "transfer":
        balanceAfter -= transactionData.amount;
        break;
    }

    try {
      const newTransaction = await supabaseService.createTransaction(
        transactionData,
        user.id,
        account.balance,
        balanceAfter
      );

      // Reload all data to ensure consistency
      await loadAllData();
      
      toast.success(`Transaction ${getTransactionTypeLabel(transactionData.type)} effectuée`);
      return newTransaction;
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      toast.error("Erreur lors de la création de la transaction");
      throw error;
    }
  };

  const createLoan = async (loanData: Omit<Loan, "id" | "status" | "payments">) => {
    if (!user) {
      toast.error("Vous devez être connecté");
      throw new Error("Utilisateur non authentifié");
    }

    try {
      const newLoan = await supabaseService.createLoan(loanData, user.id);

      // Create deposit transaction for the loan
      await createTransaction({
        type: "deposit",
        amount: loanData.amount,
        accountId: loanData.accountId,
        description: `Prêt accordé - ${loanData.amount} à ${loanData.interestRate}%`,
      });

      // Reload all data to ensure consistency
      await loadAllData();
      
      toast.success(`Prêt accordé à ${loanData.clientName}`);
    } catch (error: any) {
      console.error("Error creating loan:", error);
      toast.error("Erreur lors de la création du prêt");
      throw error;
    }
  };

  const getTransactionsByAccount = (accountId: string) => {
    return transactions.filter(tx => tx.accountId === accountId);
  };

  const getLoansByAccount = (accountId: string) => {
    return loans.filter(loan => loan.accountId === accountId);
  };

  const getReportByDate = (date: string) => {
    return reports.find(report => report.date === date);
  };

  const deleteAccount = async (accountId: string) => {
    const accountToDelete = accounts.find(account => account.id === accountId);
    
    if (!accountToDelete) {
      toast.error("Compte introuvable");
      return;
    }
    
    // Check if there are active loans
    const activeLoans = loans.filter(
      loan => loan.accountId === accountId && loan.status === "active"
    );
    
    if (activeLoans.length > 0) {
      toast.error("Impossible de supprimer un compte avec des prêts actifs");
      return;
    }

    try {
      await supabaseService.deleteAccount(accountId);
      await loadAllData();
      toast.success(`Compte de ${accountToDelete.clientName} supprimé`);
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error("Erreur lors de la suppression du compte");
    }
  };

  const updateAccount = async (accountId: string, updates: Partial<Account>) => {
    try {
      await supabaseService.updateAccount(accountId, updates);
      await loadAllData();
      toast.success("Compte mis à jour");
    } catch (error: any) {
      console.error("Error updating account:", error);
      toast.error("Erreur lors de la mise à jour du compte");
    }
  };

  const value = {
    accounts,
    transactions,
    loans,
    reports,
    getAccountById,
    createAccount,
    createTransaction,
    createLoan,
    getTransactionsByAccount,
    getLoansByAccount,
    getReportByDate,
    deleteAccount,
    updateAccount,
  };

  return <BankingContext.Provider value={value}>{children}</BankingContext.Provider>;
};

export const useBanking = (): BankingContextType => {
  const context = useContext(BankingContext);
  if (context === undefined) {
    throw new Error("useBanking must be used within a BankingProvider");
  }
  return context;
};
