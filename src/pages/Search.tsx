
import React, { useState } from "react";
import { useBanking } from "@/contexts/BankingContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search as SearchIcon, CreditCard, ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Search = () => {
  const { accounts, transactions } = useBanking();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<{
    accounts: typeof accounts;
    transactions: typeof transactions;
  }>({ accounts: [], transactions: [] });

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults({ accounts: [], transactions: [] });
      return;
    }

    const term = searchTerm.toLowerCase();
    
    // Search accounts
    const filteredAccounts = accounts.filter(
      (account) =>
        account.clientName.toLowerCase().includes(term) ||
        account.accountNumber.toLowerCase().includes(term) ||
        (account.email && account.email.toLowerCase().includes(term)) ||
        (account.phone && account.phone.toLowerCase().includes(term))
    );
    
    // Search transactions
    const filteredTransactions = transactions.filter(
      (transaction) =>
        transaction.description.toLowerCase().includes(term) ||
        transaction.performedBy.toLowerCase().includes(term) ||
        transaction.accountId.toLowerCase().includes(term)
    );
    
    setSearchResults({
      accounts: filteredAccounts,
      transactions: filteredTransactions,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Recherche globale</h1>
      
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Rechercher par nom, numéro de compte, email, téléphone..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
        </div>
        <Button onClick={handleSearch}>Rechercher</Button>
      </div>

      {(searchResults.accounts.length > 0 || searchResults.transactions.length > 0) && (
        <Tabs defaultValue="accounts" className="w-full">
          <TabsList>
            <TabsTrigger value="accounts">
              Comptes ({searchResults.accounts.length})
            </TabsTrigger>
            <TabsTrigger value="transactions">
              Transactions ({searchResults.transactions.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="accounts">
            <Card>
              <CardHeader>
                <CardTitle>Comptes trouvés</CardTitle>
                <CardDescription>
                  Résultats de recherche pour les comptes clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                {searchResults.accounts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom du client</TableHead>
                        <TableHead>Numéro de compte</TableHead>
                        <TableHead>Solde</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.accounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">{account.clientName}</TableCell>
                          <TableCell>{account.accountNumber}</TableCell>
                          <TableCell>{account.balance.toFixed(2)} €</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/accounts/${account.id}`}>
                                Voir détails
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    Aucun compte trouvé pour cette recherche
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transactions trouvées</CardTitle>
                <CardDescription>
                  Résultats de recherche pour les transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {searchResults.transactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {transaction.type === "deposit" && "Dépôt"}
                            {transaction.type === "withdrawal" && "Retrait"}
                            {transaction.type === "transfer" && "Transfert"}
                          </TableCell>
                          <TableCell>{transaction.amount.toFixed(2)} €</TableCell>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/accounts/${transaction.accountId}`}>
                                Voir compte
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    Aucune transaction trouvée pour cette recherche
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      
      {searchTerm && !searchResults.accounts.length && !searchResults.transactions.length && (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <SearchIcon className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium">Aucun résultat trouvé</h3>
          <p className="text-gray-500 mt-2">
            Aucun compte ou transaction ne correspond à votre recherche
          </p>
        </div>
      )}
    </div>
  );
};

export default Search;
