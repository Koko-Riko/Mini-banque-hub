
import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useBanking } from "@/contexts/BankingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  CreditCard,
  Edit,
  PiggyBank,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AccountDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAccountById, getTransactionsByAccount, getLoansByAccount } = useBanking();

  const account = getAccountById(id || "");
  const transactions = getTransactionsByAccount(id || "");
  const loans = getLoansByAccount(id || "");

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold mb-4">Compte introuvable</h2>
        <p className="text-gray-500 mb-6">
          Le compte que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <Button onClick={() => navigate("/accounts")}>Retour à la liste des comptes</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/accounts")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Détails du compte</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client</CardTitle>
            <CreditCard className="h-4 w-4 text-banking-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{account.clientName}</div>
            <p className="text-xs text-gray-500">{account.accountNumber}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde actuel</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-banking-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{account.balance.toFixed(2)} €</div>
            <p className="text-xs text-gray-500">
              Dernière activité le {account.lastActivity}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ArrowDown className="h-4 w-4 text-banking-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-gray-500">
              {transactions.length > 0
                ? `Dernière: ${new Date(
                    transactions.sort(
                      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                    )[0].date
                  ).toLocaleDateString("fr-FR")}`
                : "Aucune transaction"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prêts actifs</CardTitle>
            <PiggyBank className="h-4 w-4 text-banking-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loans.filter((loan) => loan.status === "active").length}
            </div>
            <p className="text-xs text-gray-500">
              {loans.filter((loan) => loan.status === "active").length > 0
                ? `${loans
                    .filter((loan) => loan.status === "active")
                    .reduce((sum, loan) => sum + loan.amount, 0)
                    .toFixed(2)} € total`
                : "Aucun prêt actif"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <Button asChild>
          <Link to={`/transactions/new?accountId=${account.id}`}>
            <ArrowUpDown className="mr-2 h-4 w-4" /> Nouvelle transaction
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={`/accounts/${account.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" /> Modifier le compte
          </Link>
        </Button>
        {loans.filter((loan) => loan.status === "active").length === 0 && (
          <Button asChild variant="outline">
            <Link to={`/loans/new?accountId=${account.id}`}>
              <PiggyBank className="mr-2 h-4 w-4" /> Nouveau prêt
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="loans">Prêts</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Historique des transactions</CardTitle>
              <CardDescription>
                Toutes les transactions effectuées sur ce compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">Aucune transaction pour ce compte</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions
                      .sort(
                        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                      )
                      .map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {new Date(transaction.date).toLocaleString("fr-FR")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  transaction.type === "deposit"
                                    ? "bg-banking-success/20 text-banking-success"
                                    : transaction.type === "withdrawal"
                                    ? "bg-banking-danger/20 text-banking-danger"
                                    : "bg-banking-primary/20 text-banking-primary"
                                }`}
                              >
                                {transaction.type === "deposit" ? (
                                  <ArrowDown className="h-4 w-4" />
                                ) : transaction.type === "withdrawal" ? (
                                  <ArrowUp className="h-4 w-4" />
                                ) : (
                                  <ArrowUpDown className="h-4 w-4" />
                                )}
                              </div>
                              <span>
                                {transaction.type === "deposit"
                                  ? "Dépôt"
                                  : transaction.type === "withdrawal"
                                  ? "Retrait"
                                  : "Virement"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell
                            className={`text-right font-medium ${
                              transaction.type === "deposit"
                                ? "text-banking-success"
                                : "text-banking-danger"
                            }`}
                          >
                            {transaction.type === "deposit" ? "+" : "-"}
                            {transaction.amount.toFixed(2)} €
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle>Historique des prêts</CardTitle>
              <CardDescription>Tous les prêts accordés pour ce compte</CardDescription>
            </CardHeader>
            <CardContent>
              {loans.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">Aucun prêt pour ce compte</p>
                  <Button className="mt-4" asChild>
                    <Link to={`/loans/new?accountId=${account.id}`}>
                      <PiggyBank className="mr-2 h-4 w-4" /> Nouveau prêt
                    </Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date de début</TableHead>
                      <TableHead>Date d'échéance</TableHead>
                      <TableHead>Taux d'intérêt</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>{loan.startDate}</TableCell>
                        <TableCell>{loan.dueDate}</TableCell>
                        <TableCell>{loan.interestRate}%</TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              loan.status === "active"
                                ? "bg-banking-primary/20 text-banking-primary"
                                : loan.status === "paid"
                                ? "bg-banking-success/20 text-banking-success"
                                : "bg-banking-danger/20 text-banking-danger"
                            }`}
                          >
                            {loan.status === "active"
                              ? "Actif"
                              : loan.status === "paid"
                              ? "Remboursé"
                              : "En retard"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {loan.amount.toFixed(2)} €
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountDetail;
