
import { Report, TransactionType } from "@/types/banking";

export const updateReportForTransaction = (
  reports: Report[], 
  setReports: React.Dispatch<React.SetStateAction<Report[]>>, 
  type: TransactionType, 
  amount: number
) => {
  const today = new Date().toISOString().split('T')[0];
  const existingReport = reports.find(report => report.date === today);
  
  if (existingReport) {
    setReports(
      reports.map(report => {
        if (report.date === today) {
          return {
            ...report,
            totalTransactions: report.totalTransactions + 1,
            totalDeposits: type === "deposit" ? report.totalDeposits + amount : report.totalDeposits,
            totalWithdrawals: type === "withdrawal" ? report.totalWithdrawals + amount : report.totalWithdrawals,
            totalTransfers: type === "transfer" ? report.totalTransfers + amount : report.totalTransfers,
          };
        }
        return report;
      })
    );
  } else {
    const newReport: Report = {
      date: today,
      totalTransactions: 1,
      totalDeposits: type === "deposit" ? amount : 0,
      totalWithdrawals: type === "withdrawal" ? amount : 0,
      totalTransfers: type === "transfer" ? amount : 0,
      newAccounts: 0,
      newLoans: 0,
    };
    setReports([...reports, newReport]);
  }
};

export const updateReportForNewAccount = (
  reports: Report[], 
  setReports: React.Dispatch<React.SetStateAction<Report[]>>
) => {
  const today = new Date().toISOString().split('T')[0];
  const existingReport = reports.find(report => report.date === today);
  
  if (existingReport) {
    setReports(
      reports.map(report => {
        if (report.date === today) {
          return {
            ...report,
            newAccounts: report.newAccounts + 1,
          };
        }
        return report;
      })
    );
  } else {
    const newReport: Report = {
      date: today,
      totalTransactions: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalTransfers: 0,
      newAccounts: 1,
      newLoans: 0,
    };
    setReports([...reports, newReport]);
  }
};

export const updateReportForNewLoan = (
  reports: Report[], 
  setReports: React.Dispatch<React.SetStateAction<Report[]>>
) => {
  const today = new Date().toISOString().split('T')[0];
  const existingReport = reports.find(report => report.date === today);
  
  if (existingReport) {
    setReports(
      reports.map(report => {
        if (report.date === today) {
          return {
            ...report,
            newLoans: report.newLoans + 1,
          };
        }
        return report;
      })
    );
  } else {
    const newReport: Report = {
      date: today,
      totalTransactions: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalTransfers: 0,
      newAccounts: 0,
      newLoans: 1,
    };
    setReports([...reports, newReport]);
  }
};
