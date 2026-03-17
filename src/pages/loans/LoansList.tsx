
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useBanking } from "@/contexts/BankingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BanknoteIcon, CalendarIcon, PiggyBank, PlusCircle, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

const LoansList = () => {
  const navigate = useNavigate();
  const { loans, accounts } = useBanking();
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrer les prêts en fonction du terme de recherche
  const filteredLoans = loans.filter(
    (loan) =>
      loan.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accounts.find((a) => a.id === loan.accountId)?.accountNumber.includes(searchTerm)
  );

  // Fonction pour obtenir la classe de style selon le statut du prêt
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "active":
        return "bg-banking-primary/20 text-banking-primary";
      case "paid":
        return "bg-banking-success/20 text-banking-success";
      case "overdue":
        return "bg-banking-danger/20 text-banking-danger";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  // Fonction pour traduire le statut en français
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Actif";
      case "paid":
        return "Remboursé";
      case "overdue":
        return "En retard";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-xl font-bold">Gestion des prêts</h1>
        <Button asChild>
          <Link to="/loans/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Nouveau prêt
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des prêts</CardTitle>
          <CardDescription>
            Consultez et gérez tous les prêts accordés aux clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Rechercher par client ou numéro de compte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {filteredLoans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <PiggyBank className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">Aucun prêt trouvé</p>
              <Button asChild variant="outline" className="mt-2">
                <Link to="/loans/new">
                  <PlusCircle className="mr-2 h-4 w-4" /> Créer un prêt
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Date de début</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Taux</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLoans.map((loan) => (
                    <TableRow
                      key={loan.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/loans/${loan.id}`)}
                    >
                      <TableCell className="font-medium">{loan.clientName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          {loan.startDate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          {loan.dueDate}
                        </div>
                      </TableCell>
                      <TableCell>{loan.interestRate}%</TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusStyles(
                            loan.status
                          )}`}
                        >
                          {getStatusLabel(loan.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <BanknoteIcon className="h-4 w-4 text-banking-success" />
                          {loan.amount.toFixed(2)} €
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoansList;
