
import React from "react";
import { useBanking } from "@/contexts/BankingContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, CreditCard, PiggyBank } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GeneralAdminDashboard from "@/components/dashboard/GeneralAdminDashboard";

const Dashboard = () => {
  const { user } = useAuth();
  const { accounts, transactions, loans } = useBanking();

  const isAdmin = user?.role === "admin";
  const isGeneralAdmin = user?.isGeneralAdmin ?? false;

  // Si c'est un admin général, afficher le tableau de bord différencié
  if (isGeneralAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Tableau de bord - Administration Générale</h1>
          <div className="flex items-center gap-4">
            <Button asChild>
              <Link to="/admin/users">Gérer les utilisateurs</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/settings">Paramètres</Link>
            </Button>
          </div>
        </div>
        <GeneralAdminDashboard />
      </div>
    );
  }

  const todayTransactions = transactions.filter(
    (tx) => tx.date.split("T")[0] === new Date().toISOString().split("T")[0]
  );

  const totalDepositsToday = todayTransactions
    .filter((tx) => tx.type === "deposit")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalWithdrawalsToday = todayTransactions
    .filter((tx) => tx.type === "withdrawal")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const activeLoans = loans.filter((loan) => loan.status === "active");

  // Déterminer la devise dominante pour l'affichage
  const getCurrencySymbol = () => {
    if (accounts.length === 0) return "HTG";
    const htgCount = accounts.filter(a => a.currency === "HTG").length;
    const usdCount = accounts.filter(a => a.currency === "USD").length;
    return htgCount >= usdCount ? "HTG" : "$";
  };

  const currencySymbol = getCurrencySymbol();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Tableau de bord</h1>
        <div className="flex items-center gap-4">
          {isAdmin ? (
            <Button asChild>
              <Link to="/admin/users">Gérer les utilisateurs</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/accounts/new">Nouveau compte</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comptes totaux</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
            <p className="text-xs text-muted-foreground">
              {accounts.length > 0 ? "+1 depuis le mois dernier" : "Aucun compte"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépôts aujourd'hui</CardTitle>
            <ArrowDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDepositsToday.toLocaleString("fr-FR")} {currencySymbol}</div>
            <p className="text-xs text-muted-foreground">{todayTransactions.filter(tx => tx.type === "deposit").length} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retraits aujourd'hui</CardTitle>
            <ArrowUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWithdrawalsToday.toLocaleString("fr-FR")} {currencySymbol}</div>
            <p className="text-xs text-muted-foreground">{todayTransactions.filter(tx => tx.type === "withdrawal").length} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prêts actifs</CardTitle>
            <PiggyBank className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoans.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeLoans.reduce((sum, loan) => sum + loan.amount, 0).toLocaleString("fr-FR")} {currencySymbol} total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transactions récentes</CardTitle>
            <CardDescription>
              Les {Math.min(5, transactions.length)} dernières transactions effectuées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune transaction</p>
            ) : (
              <div className="space-y-2">
                {transactions
                  .slice()
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((transaction) => {
                    const account = accounts.find((a) => a.id === transaction.accountId);
                    return (
                      <div key={transaction.id} className="transaction-item">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              transaction.type === "deposit"
                                ? "bg-green-100 text-green-600"
                                : transaction.type === "withdrawal"
                                ? "bg-red-100 text-red-600"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {transaction.type === "deposit" ? (
                              <ArrowDown className="h-5 w-5" />
                            ) : transaction.type === "withdrawal" ? (
                              <ArrowUp className="h-5 w-5" />
                            ) : (
                              <ArrowUp className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {transaction.type === "deposit"
                                ? "Dépôt"
                                : transaction.type === "withdrawal"
                                ? "Retrait"
                                : "Virement"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {account?.clientName} • {new Date(transaction.date).toLocaleString("fr-FR")}
                            </p>
                          </div>
                        </div>
                        <div className="font-medium">
                          {transaction.type === "deposit" ? "+" : "-"}
                          {transaction.amount.toLocaleString("fr-FR")} {account?.currency || "HTG"}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link to="/transactions">Voir toutes les transactions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comptes clients</CardTitle>
            <CardDescription>Liste des comptes clients actifs</CardDescription>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun compte client</p>
            ) : (
              <div className="space-y-2">
                {accounts.slice(0, 5).map((account) => (
                  <div key={account.id} className="transaction-item">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{account.clientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {account.accountNumber} • Créé le {account.creationDate}
                        </p>
                      </div>
                    </div>
                    <div className="font-medium">{account.balance.toLocaleString("fr-FR")} {account.currency || "HTG"}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link to="/accounts">Voir tous les comptes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
