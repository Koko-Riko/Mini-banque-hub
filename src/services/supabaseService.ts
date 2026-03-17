import { supabase } from "@/integrations/supabase/client";
import { Account, Transaction, Loan, Report } from "@/types/banking";

// Mapping functions to convert database types to app types
const mapDBAccountToApp = (dbAccount: any): Account => {
  return {
    id: dbAccount.id,
    accountNumber: dbAccount.account_number,
    clientName: dbAccount.full_name,
    accountType: dbAccount.account_type === 'savings' ? 'Compte Epargne' :
                 dbAccount.account_type === 'checking' ? 'Compte Courant' :
                 'Compte d\'investissement',
    balance: parseFloat(dbAccount.balance),
    status: dbAccount.status === 'active' ? 'active' :
            dbAccount.status === 'inactive' ? 'inactive' :
            dbAccount.status === 'suspended' ? 'suspended' : 'closed',
    creationDate: dbAccount.created_at.split('T')[0],
    lastActivity: dbAccount.last_activity?.split('T')[0] || dbAccount.created_at.split('T')[0],
    // Additional fields from new schema
    firstName: dbAccount.first_name,
    lastName: dbAccount.last_name,
    gender: dbAccount.gender,
    birthDate: dbAccount.birth_date,
    birthPlace: dbAccount.birth_place,
    documentType: dbAccount.document_type === 'passport' ? 'Passeport' :
                  dbAccount.document_type === 'id_card' ? 'Carte Identité' :
                  'Permis de Conduire',
    documentNumber: dbAccount.document_number,
    address: dbAccount.address,
    phone: dbAccount.phone,
    email: dbAccount.email || undefined,
    activity: dbAccount.activity === 'salary' ? 'Salaire' :
              dbAccount.activity === 'student' ? 'Etudiant' :
              dbAccount.activity === 'scholar' ? 'Ecolier' :
              'Travail Autonome',
    initialDeposit: parseFloat(dbAccount.initial_deposit),
    currency: dbAccount.currency,
    photoUrl: dbAccount.photo_url || undefined,
  };
};

const mapDBTransactionToApp = (dbTx: any): Transaction => {
  return {
    id: dbTx.id,
    type: dbTx.type === 'deposit' ? 'deposit' :
          dbTx.type === 'withdrawal' ? 'withdrawal' :
          dbTx.type === 'transfer' ? 'transfer' :
          dbTx.type === 'loan_payment' ? 'loan_payment' : 'interest',
    amount: parseFloat(dbTx.amount),
    accountId: dbTx.account_id,
    date: dbTx.created_at,
    performedBy: dbTx.performed_by,
    description: dbTx.description || undefined,
    destinationAccountId: dbTx.destination_account_id || undefined,
  };
};

const mapDBLoanToApp = (dbLoan: any): Loan => {
  return {
    id: dbLoan.id,
    accountId: dbLoan.account_id,
    clientName: '', // Will be populated from account
    amount: parseFloat(dbLoan.amount),
    interestRate: parseFloat(dbLoan.interest_rate),
    durationMonths: dbLoan.duration_months,
    monthlyPayment: parseFloat(dbLoan.monthly_payment),
    totalAmount: parseFloat(dbLoan.total_amount),
    remainingAmount: parseFloat(dbLoan.remaining_amount),
    startDate: dbLoan.start_date || undefined,
    endDate: dbLoan.end_date || undefined,
    nextPaymentDate: dbLoan.next_payment_date || undefined,
    status: dbLoan.status === 'active' ? 'active' :
            dbLoan.status === 'pending' ? 'pending' :
            dbLoan.status === 'completed' ? 'completed' : 'defaulted',
    payments: [], // Will be populated separately if needed
  };
};

const mapDBReportToApp = (dbReport: any): Report => {
  return {
    id: dbReport.id,
    date: dbReport.report_date,
    totalDeposits: parseFloat(dbReport.total_deposits),
    totalWithdrawals: parseFloat(dbReport.total_withdrawals),
    totalTransfers: parseFloat(dbReport.total_transfers),
    totalLoanPayments: parseFloat(dbReport.total_loan_payments),
    activeAccounts: dbReport.active_accounts,
    newAccounts: dbReport.new_accounts,
    totalLoans: parseFloat(dbReport.total_loans),
  };
};

export class SupabaseService {
  // Accounts
  async getAccounts(): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(mapDBAccountToApp) || [];
  }

  async getAccountById(id: string): Promise<Account | null> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapDBAccountToApp(data) : null;
  }

  async createAccount(accountData: any, userId: string): Promise<Account> {
    const dbData: any = {
      first_name: accountData.firstName,
      last_name: accountData.lastName,
      gender: accountData.gender === 'homme' ? 'male' : 
              accountData.gender === 'femme' ? 'female' : 
              accountData.gender === 'male' || accountData.gender === 'female' ? accountData.gender : 'other',
      birth_date: accountData.birthDate,
      birth_place: accountData.birthPlace,
      document_type: accountData.documents?.passport ? 'passport' :
                     accountData.documents?.idCard ? 'id_card' : 'driver_license',
      document_number: accountData.documents?.documentNumber || accountData.documentNumber,
      address: accountData.address,
      phone: accountData.phone,
      email: accountData.email || null,
      activity: accountData.activity === 'salarie' ? 'salary' :
                accountData.activity === 'etudiant' ? 'student' :
                accountData.activity === 'ecolier' ? 'scholar' : 
                accountData.activity === 'salary' || accountData.activity === 'student' || 
                accountData.activity === 'scholar' ? accountData.activity : 'self_employed',
      account_type: accountData.accountType === 'courant' ? 'checking' :
                    accountData.accountType === 'epargne' ? 'savings' : 
                    accountData.accountType === 'checking' || accountData.accountType === 'savings' ? accountData.accountType : 'investment',
      initial_deposit: parseFloat(accountData.balance) || 0,
      balance: parseFloat(accountData.balance) || 0,
      currency: accountData.currency || 'GHT',
      photo_url: accountData.photo || null,
      created_by: userId,
    };

    const { data, error } = await supabase
      .from('accounts')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;
    return mapDBAccountToApp(data);
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<void> {
    const dbUpdates: any = {};
    
    if (updates.firstName) dbUpdates.first_name = updates.firstName;
    if (updates.lastName) dbUpdates.last_name = updates.lastName;
    if (updates.firstName || updates.lastName) {
      dbUpdates.full_name = `${updates.firstName || ''} ${updates.lastName || ''}`.trim();
    }
    if (updates.address) dbUpdates.address = updates.address;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.email !== undefined) dbUpdates.email = updates.email || null;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.birthDate) dbUpdates.birth_date = updates.birthDate;
    if (updates.birthPlace) dbUpdates.birth_place = updates.birthPlace;
    if (updates.gender) {
      const genderMap: Record<string, string> = { homme: 'male', femme: 'female', autre: 'other' };
      dbUpdates.gender = genderMap[updates.gender] || updates.gender;
    }
    if (updates.activity) {
      const activityMap: Record<string, string> = { salarie: 'salary', etudiant: 'student', eleve: 'scholar', independant: 'self_employed' };
      dbUpdates.activity = activityMap[updates.activity] || updates.activity;
    }
    if (updates.documentNumber) dbUpdates.document_number = updates.documentNumber;
    if (updates.photo) dbUpdates.photo_url = updates.photo;

    const { error } = await supabase
      .from('accounts')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
  }

  async deleteAccount(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(mapDBTransactionToApp) || [];
  }

  async getTransactionsByAccount(accountId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(mapDBTransactionToApp) || [];
  }

  async createTransaction(transactionData: any, userId: string, balanceBefore: number, balanceAfter: number): Promise<Transaction> {
    const dbData: any = {
      account_id: transactionData.accountId,
      type: transactionData.type,
      amount: transactionData.amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      destination_account_id: transactionData.destinationAccountId || null,
      description: transactionData.description || null,
      performed_by: userId,
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert(dbData)
      .select()
      .single();

    if (error) throw error;
    return mapDBTransactionToApp(data);
  }

  // Loans
  async getLoans(): Promise<Loan[]> {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        accounts!inner(full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data?.map(loan => ({
      ...mapDBLoanToApp(loan),
      clientName: loan.accounts.full_name
    })) || [];
  }

  async getLoansByAccount(accountId: string): Promise<Loan[]> {
    const { data, error } = await supabase
      .from('loans')
      .select(`
        *,
        accounts!inner(full_name)
      `)
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data?.map(loan => ({
      ...mapDBLoanToApp(loan),
      clientName: loan.accounts.full_name
    })) || [];
  }

  async createLoan(loanData: any, userId: string): Promise<Loan> {
    const dbData: any = {
      account_id: loanData.accountId,
      amount: loanData.amount,
      interest_rate: loanData.interestRate,
      duration_months: loanData.durationMonths,
      total_amount: loanData.totalAmount,
      remaining_amount: loanData.totalAmount,
      monthly_payment: loanData.monthlyPayment,
      start_date: loanData.startDate || null,
      end_date: loanData.endDate || null,
      next_payment_date: loanData.nextPaymentDate || null,
      status: 'active',
      created_by: userId,
    };

    const { data, error } = await supabase
      .from('loans')
      .insert(dbData)
      .select(`
        *,
        accounts!inner(full_name)
      `)
      .single();

    if (error) throw error;
    
    return {
      ...mapDBLoanToApp(data),
      clientName: data.accounts.full_name
    };
  }

  // Reports
  async getReports(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('report_date', { ascending: false });

    if (error) throw error;
    return data?.map(mapDBReportToApp) || [];
  }

  async getReportByDate(date: string): Promise<Report | null> {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('report_date', date)
      .maybeSingle();

    if (error) throw error;
    return data ? mapDBReportToApp(data) : null;
  }

  async createOrUpdateReport(reportData: any, userId: string): Promise<void> {
    const dbData = {
      report_number: `RPT${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
      report_date: reportData.date,
      total_deposits: reportData.totalDeposits || 0,
      total_withdrawals: reportData.totalWithdrawals || 0,
      total_transfers: reportData.totalTransfers || 0,
      total_loan_payments: reportData.totalLoanPayments || 0,
      active_accounts: reportData.activeAccounts || 0,
      new_accounts: reportData.newAccounts || 0,
      total_loans: reportData.totalLoans || 0,
      created_by: userId,
    };

    const { error } = await supabase
      .from('reports')
      .upsert(dbData, {
        onConflict: 'report_date',
      });

    if (error) throw error;
  }
}

export const supabaseService = new SupabaseService();
