
import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useBanking } from "@/contexts/BankingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  BanknoteIcon,
  Calendar,
  Check,
  CreditCard,
  FileText,
  PiggyBank,
  Plus,
  XCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const LoanDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loans, accounts, getAccountById } = useBanking();
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  const loan = loans.find((l) => l.id === id);
  const account = loan ? getAccountById(loan.accountId) : undefined;

  if (!loan) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold mb-4">Prêt introuvable</h2>
        <p className="text-gray-500 mb-6">
          Le prêt que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <Button onClick={() => navigate("/loans")}>Retour à la liste des prêts</Button>
      </div>
    );
  }

  // Calcul des paiements totaux et du montant restant dû
  const totalPayments = loan.payments.reduce((total, payment) => total + payment.amount, 0);
  const remainingAmount = loan.amount - totalPayments;

  // Calcul du pourcentage de remboursement
  const repaymentPercentage = (totalPayments / loan.amount) * 100;

  // Traduction des statuts
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

  // Fonction pour ajouter un paiement (simulation)
  const handleAddPayment = () => {
    const amount = parseFloat(paymentAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error("Veuillez saisir un montant valide");
      return;
    }

    if (amount > remainingAmount) {
      toast.error("Le montant du paiement ne peut pas dépasser le montant restant dû");
      return;
    }

    // Simuler l'ajout d'un paiement (dans une vraie application, cela appellerait une API)
    toast.success(`Paiement de ${amount.toFixed(2)}€ enregistré`);
    setIsAddingPayment(false);
    setPaymentAmount("");
    
    // Note: Dans une vraie application, il faudrait mettre à jour l'état du prêt
    // et potentiellement changer son statut si entièrement remboursé
  };

  // Calculer si le prêt est en retard
  const isOverdue = new Date(loan.dueDate) < new Date() && loan.status === "active";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/loans")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Détails du prêt</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client</CardTitle>
            <CreditCard className="h-4 w-4 text-banking-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loan.clientName}</div>
            <p className="text-xs text-gray-500">
              {account ? (
                <Link to={`/accounts/${account.id}`} className="hover:underline text-banking-primary">
                  Voir le compte ({account.accountNumber})
                </Link>
              ) : (
                "Compte associé non trouvé"
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant du prêt</CardTitle>
            <BanknoteIcon className="h-4 w-4 text-banking-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loan.amount.toFixed(2)} €</div>
            <p className="text-xs text-gray-500">
              Taux d'intérêt: {loan.interestRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statut</CardTitle>
            <PiggyBank className="h-4 w-4 text-banking-accent" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusStyles(
                  isOverdue ? "overdue" : loan.status
                )}`}
              >
                {getStatusLabel(isOverdue ? "overdue" : loan.status)}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {isOverdue 
                ? "Le prêt a dépassé sa date d'échéance" 
                : `Échéance: ${loan.dueDate}`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>État du remboursement</CardTitle>
          <CardDescription>
            Progression du remboursement du prêt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression</span>
              <span>{repaymentPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={repaymentPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="rounded-lg border p-3">
              <div className="text-sm text-gray-500">Montant initial</div>
              <div className="text-xl font-semibold">{loan.amount.toFixed(2)} €</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm text-gray-500">Déjà remboursé</div>
              <div className="text-xl font-semibold text-banking-success">
                {totalPayments.toFixed(2)} €
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm text-gray-500">Restant à payer</div>
              <div className="text-xl font-semibold text-banking-accent">
                {remainingAmount.toFixed(2)} €
              </div>
            </div>
          </div>
        </CardContent>
        {loan.status === "active" && (
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <div className="text-sm text-gray-500">
              {loan.payments.length > 0
                ? `Dernier paiement: ${new Date(
                    loan.payments[loan.payments.length - 1].date
                  ).toLocaleDateString("fr-FR")}`
                : "Aucun paiement effectué"}
            </div>
            <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un paiement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau paiement</DialogTitle>
                  <DialogDescription>
                    Enregistrez un nouveau paiement pour ce prêt
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Montant
                    </Label>
                    <div className="col-span-3 relative">
                      <BanknoteIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        className="pl-10"
                        placeholder="0.00"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Restant dû</Label>
                    <div className="col-span-3">
                      <span className="text-banking-accent font-semibold">
                        {remainingAmount.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingPayment(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddPayment}>Enregistrer le paiement</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des paiements</CardTitle>
          <CardDescription>
            Tous les paiements effectués pour ce prêt
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loan.payments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Aucun paiement n'a encore été enregistré</p>
              {loan.status === "active" && (
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => setIsAddingPayment(true)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un paiement
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loan.payments
                  .slice()
                  .sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            payment.status === "paid"
                              ? "bg-banking-success/20 text-banking-success"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {payment.status === "paid" ? "Payé" : "En attente"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {payment.amount.toFixed(2)} €
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" asChild>
          <Link to={`/accounts/${loan.accountId}`}>
            <CreditCard className="mr-2 h-4 w-4" /> Voir le compte
          </Link>
        </Button>
        <Button asChild>
          <Link to="/loans">
            <ArrowRight className="mr-2 h-4 w-4" /> Tous les prêts
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default LoanDetail;
