
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useBanking } from "@/contexts/BankingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp, ArrowUpDown, Plus, Search } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const TransactionsList = () => {
  const { transactions, accounts } = useBanking();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterAccount, setFilterAccount] = useState<string | null>(null);

  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by type if selected
    if (filterType && transaction.type !== filterType) {
      return false;
    }

    // Filter by account if selected
    if (filterAccount && transaction.accountId !== filterAccount) {
      return false;
    }

    // Filter by search term
    const account = accounts.find((a) => a.id === transaction.accountId);
    if (
      searchTerm &&
      !transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(account && account.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Transactions</h1>
        <Button asChild>
          <Link to="/transactions/new">
            <Plus className="mr-2 h-4 w-4" /> Nouvelle transaction
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Rechercher par description ou client..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={filterType || "all"} onValueChange={(value) => setFilterType(value === "all" ? null : value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type de transaction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="deposit">Dépôt</SelectItem>
            <SelectItem value="withdrawal">Retrait</SelectItem>
            <SelectItem value="transfer">Virement</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterAccount || "all"} onValueChange={(value) => setFilterAccount(value === "all" ? null : value)}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Filtrer par compte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les comptes</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.clientName} ({account.accountNumber})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des transactions ({filteredTransactions.length})</CardTitle>
          <CardDescription>
            Historique de toutes les transactions effectuées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ArrowUpDown className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">Aucune transaction trouvée</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterType || filterAccount
                  ? "Aucune transaction ne correspond à vos critères de recherche"
                  : "Il n'y a pas encore de transactions enregistrées"}
              </p>
              <Button asChild>
                <Link to="/transactions/new">Créer une transaction</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((transaction) => {
                    const account = accounts.find((a) => a.id === transaction.accountId);
                    return (
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
                        <TableCell>
                          <Link
                            to={`/accounts/${transaction.accountId}`}
                            className="text-banking-primary hover:underline"
                          >
                            {account?.clientName || "Client inconnu"}
                          </Link>
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
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsList;
