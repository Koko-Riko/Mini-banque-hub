
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useBanking } from "@/contexts/BankingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TransactionType } from "@/types/banking";
import { z } from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Printer } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import TransactionReceipt from "@/components/transactions/TransactionReceipt";

const transactionFormSchema = z.object({
  type: z.enum(["deposit", "withdrawal", "transfer", "loan_payment"], {
    required_error: "Le type de transaction est requis",
  }),
  amount: z.number()
    .positive("Le montant doit être supérieur à 0")
    .max(1000000, "Le montant ne peut pas dépasser 1 000 000")
    .refine((val) => Number.isFinite(val), "Le montant doit être un nombre valide"),
  accountId: z.string()
    .min(1, "Le compte est requis"),
  destinationAccountId: z.string().optional(),
  description: z.string()
    .max(500, "La description ne peut pas dépasser 500 caractères")
    .trim()
    .optional(),
}).refine((data) => {
  if (data.type === "transfer") {
    return data.destinationAccountId && data.destinationAccountId.length > 0;
  }
  return true;
}, {
  message: "Le compte de destination est requis pour un virement",
  path: ["destinationAccountId"],
}).refine((data) => {
  if (data.type === "transfer") {
    return data.accountId !== data.destinationAccountId;
  }
  return true;
}, {
  message: "Le compte source et le compte de destination doivent être différents",
  path: ["destinationAccountId"],
});

const NewTransaction = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accountIdParam = searchParams.get("accountId");
  const receiptRef = useRef<HTMLDivElement>(null);

  const { accounts, createTransaction, getAccountById } = useBanking();
  const [formData, setFormData] = useState({
    type: "deposit" as TransactionType,
    amount: 0,
    accountId: accountIdParam || "",
    destinationAccountId: "",
    description: "",
  });
  const [showReceipt, setShowReceipt] = useState(false);
  const [newTransaction, setNewTransaction] = useState<any>(null);

  useEffect(() => {
    if (accountIdParam) {
      setFormData((prev) => ({ ...prev, accountId: accountIdParam }));
    }
  }, [accountIdParam]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "amount" ? parseFloat(value) : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: name === "type" ? value as TransactionType : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      transactionFormSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast.error(`Erreur de validation: ${firstError.message}`);
        return;
      }
      toast.error("Une erreur de validation s'est produite");
      return;
    }
    
    // Additional business logic validation
    const account = getAccountById(formData.accountId);
    if (!account) {
      toast.error("Compte introuvable");
      return;
    }
    
    // Check if withdrawal exceeds balance
    if (formData.type === "withdrawal" && formData.amount > account.balance) {
      toast.error("Solde insuffisant pour effectuer ce retrait");
      return;
    }
    
    try {
      const transaction = await createTransaction(formData);
      
      // Stocker la nouvelle transaction pour l'afficher sur le reçu
      setNewTransaction({
        ...transaction,
        accountInfo: {
          clientName: account.clientName,
          accountNumber: account.accountNumber
        }
      });
      
      // Afficher le reçu
      setShowReceipt(true);
    } catch (error) {
      // Error already handled in createTransaction
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow && receiptRef.current) {
      printWindow.document.write('<html><head><title>Reçu de Transaction</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; }
        .receipt { max-width: 400px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { font-size: 18px; margin-bottom: 5px; }
        .header p { font-size: 14px; color: #666; margin: 0; }
        .divider { border-top: 1px solid #ddd; margin: 15px 0; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .label { font-weight: 500; }
        .amount { font-weight: 700; font-size: 16px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      `);
      printWindow.document.write('</style></head><body>');
      printWindow.document.write('<div class="receipt">');
      // Safely serialize receipt content to prevent XSS
      if (receiptRef.current) {
        const clone = receiptRef.current.cloneNode(true) as HTMLElement;
        // Extract text content and reconstruct safely
        const receiptHTML = clone.innerHTML
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
          .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
          .replace(/on\w+='[^']*'/gi, ''); // Remove event handlers with single quotes
        printWindow.document.write(receiptHTML);
      }
      printWindow.document.write('</div></body></html>');
      printWindow.document.close();
      
      // Donner le temps au navigateur de traiter le contenu
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handleClose = () => {
    setShowReceipt(false);
    
    // Naviguer après la fermeture du reçu
    if (accountIdParam) {
      navigate(`/accounts/${accountIdParam}`);
    } else {
      navigate("/transactions");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(accountIdParam ? `/accounts/${accountIdParam}` : "/transactions")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Nouvelle transaction</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détails de la transaction</CardTitle>
          <CardDescription>
            Enregistrez une nouvelle transaction en remplissant les informations ci-dessous
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type de transaction</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Dépôt</SelectItem>
                  <SelectItem value="withdrawal">Retrait</SelectItem>
                  <SelectItem value="transfer">Virement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountId">
                {formData.type === "transfer" ? "Compte source" : "Compte"}
              </Label>
              <Select
                value={formData.accountId}
                onValueChange={(value) => handleSelectChange("accountId", value)}
                disabled={!!accountIdParam}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un compte" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.clientName} ({account.accountNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type === "transfer" && (
              <div className="space-y-2">
                <Label htmlFor="destinationAccountId">Compte de destination</Label>
                <Select
                  value={formData.destinationAccountId}
                  onValueChange={(value) => handleSelectChange("destinationAccountId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le compte de destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts
                      .filter((account) => account.id !== formData.accountId)
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.clientName} ({account.accountNumber})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Montant (€)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.amount || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Description de la transaction"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(accountIdParam ? `/accounts/${accountIdParam}` : "/transactions")}
            >
              Annuler
            </Button>
            <Button type="submit">Enregistrer la transaction</Button>
          </CardFooter>
        </form>
      </Card>

      {/* Dialogue pour afficher le reçu */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reçu de transaction</DialogTitle>
            <DialogDescription>
              La transaction a été enregistrée avec succès
            </DialogDescription>
          </DialogHeader>
          
          {newTransaction && (
            <div className="border rounded-md overflow-hidden my-3">
              <TransactionReceipt 
                ref={receiptRef}
                transaction={newTransaction}
                accountInfo={newTransaction.accountInfo} 
              />
            </div>
          )}
          
          <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
            <Button variant="outline" onClick={handleClose}>
              Fermer
            </Button>
            <Button 
              onClick={handlePrint} 
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimer le reçu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewTransaction;
