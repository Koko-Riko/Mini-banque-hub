
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter as BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { BankingProvider } from "./contexts/BankingContext";
import { OfflineProvider } from "./contexts/OfflineContext";
import { AppLayout } from "./components/layout/AppLayout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AccountsList from "./pages/accounts/AccountsList";
import NewAccount from "./pages/accounts/NewAccount";
import AccountDetail from "./pages/accounts/AccountDetail";
import TransactionsList from "./pages/transactions/TransactionsList";
import NewTransaction from "./pages/transactions/NewTransaction";
import LoansList from "./pages/loans/LoansList";
import NewLoan from "./pages/loans/NewLoan";
import LoanDetail from "./pages/loans/LoanDetail";
import ReportsList from "./pages/reports/ReportsList";
import UsersManagement from "./pages/admin/UsersManagement";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import Settings from "./pages/settings/Settings";
import AuditLogs from "./pages/admin/AuditLogs";
import ReceiptsHistory from "./pages/receipts/ReceiptsHistory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BankingProvider>
        <OfflineProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected routes */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                
                {/* Accounts */}
                <Route path="/accounts" element={<AccountsList />} />
                <Route path="/accounts/new" element={<NewAccount />} />
                <Route path="/accounts/:id" element={<AccountDetail />} />
                <Route path="/accounts/:id/edit" element={<NewAccount />} />
                
                {/* Transactions */}
                <Route path="/transactions" element={<TransactionsList />} />
                <Route path="/transactions/new" element={<NewTransaction />} />
                
                {/* Loans */}
                <Route path="/loans" element={<LoansList />} />
                <Route path="/loans/new" element={<NewLoan />} />
                <Route path="/loans/:id" element={<LoanDetail />} />
                
                {/* Reports */}
                <Route path="/reports" element={<ReportsList />} />
                
                {/* Search */}
                <Route path="/search" element={<Search />} />
                
                {/* Receipts */}
                <Route path="/receipts" element={<ReceiptsHistory />} />
                
                {/* Admin */}
                <Route path="/settings" element={<Settings />} />
                <Route path="/audit-logs" element={<AuditLogs />} />
                
                {/* Legacy admin route redirect */}
                <Route path="/admin/users" element={<Settings />} />

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </OfflineProvider>
      </BankingProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
