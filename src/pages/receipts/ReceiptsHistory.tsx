import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, Receipt, Eye, Printer, CreditCard, ArrowUpDown, UserPlus, PiggyBank } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// Receipt display is handled inline in this component

interface ReceiptItem {
  id: string;
  type: "transaction" | "account" | "loan";
  subtype?: string;
  date: string;
  amount: number;
  reference: string;
  clientName: string;
  accountNumber: string;
  description?: string;
}

const ReceiptsHistory = () => {
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      // Fetch transactions
      const { data: transactions, error: txError } = await supabase
        .from("transactions")
        .select(`
          id,
          type,
          created_at,
          amount,
          transaction_number,
          description,
          account:accounts!transactions_account_id_fkey(
            first_name,
            last_name,
            account_number
          )
        `)
        .order("created_at", { ascending: false });

      if (txError) throw txError;

      // Fetch accounts (for account opening receipts)
      const { data: accounts, error: accError } = await supabase
        .from("accounts")
        .select("id, first_name, last_name, account_number, created_at, initial_deposit")
        .order("created_at", { ascending: false });

      if (accError) throw accError;

      // Fetch loans
      const { data: loans, error: loanError } = await supabase
        .from("loans")
        .select(`
          id,
          loan_number,
          amount,
          created_at,
          account:accounts!loans_account_id_fkey(
            first_name,
            last_name,
            account_number
          )
        `)
        .order("created_at", { ascending: false });

      if (loanError) throw loanError;

      // Combine all receipts
      const allReceipts: ReceiptItem[] = [];

      // Add transactions
      transactions?.forEach((tx: any) => {
        allReceipts.push({
          id: tx.id,
          type: "transaction",
          subtype: tx.type,
          date: tx.created_at,
          amount: tx.amount,
          reference: tx.transaction_number,
          clientName: tx.account ? `${tx.account.first_name} ${tx.account.last_name}` : "N/A",
          accountNumber: tx.account?.account_number || "N/A",
          description: tx.description,
        });
      });

      // Add account openings
      accounts?.forEach((acc) => {
        allReceipts.push({
          id: acc.id,
          type: "account",
          subtype: "opening",
          date: acc.created_at,
          amount: acc.initial_deposit,
          reference: acc.account_number,
          clientName: `${acc.first_name} ${acc.last_name}`,
          accountNumber: acc.account_number,
          description: "Ouverture de compte",
        });
      });

      // Add loans
      loans?.forEach((loan: any) => {
        allReceipts.push({
          id: loan.id,
          type: "loan",
          subtype: "disbursement",
          date: loan.created_at,
          amount: loan.amount,
          reference: loan.loan_number,
          clientName: loan.account ? `${loan.account.first_name} ${loan.account.last_name}` : "N/A",
          accountNumber: loan.account?.account_number || "N/A",
          description: "Décaissement de prêt",
        });
      });

      // Sort by date
      allReceipts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setReceipts(allReceipts);
    } catch (error) {
      console.error("Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string, subtype?: string) => {
    if (type === "account") return <UserPlus className="h-4 w-4" />;
    if (type === "loan") return <PiggyBank className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const getTypeLabel = (type: string, subtype?: string) => {
    if (type === "account") return "Ouverture";
    if (type === "loan") return "Prêt";
    switch (subtype) {
      case "deposit": return "Dépôt";
      case "withdrawal": return "Retrait";
      case "transfer": return "Transfert";
      case "loan_payment": return "Remboursement";
      default: return subtype || type;
    }
  };

  const getTypeBadgeVariant = (type: string, subtype?: string): "default" | "secondary" | "destructive" | "outline" => {
    if (type === "account") return "default";
    if (type === "loan") return "secondary";
    if (subtype === "deposit") return "default";
    if (subtype === "withdrawal") return "destructive";
    return "outline";
  };

  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch =
      receipt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.accountNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || receipt.type === filterType;

    return matchesSearch && matchesType;
  });

  const handleViewReceipt = (receipt: ReceiptItem) => {
    setSelectedReceipt(receipt);
    setIsDialogOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Historique des Reçus</h1>
        <p className="text-muted-foreground">
          Consultez et réimprimez tous les reçus de transactions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Tous les Reçus
          </CardTitle>
          <CardDescription>
            {filteredReceipts.length} reçu(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, référence ou numéro de compte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="transaction">Transactions</SelectItem>
                <SelectItem value="account">Ouvertures</SelectItem>
                <SelectItem value="loan">Prêts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <p className="text-muted-foreground text-center py-8">Chargement...</p>
          ) : filteredReceipts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Aucun reçu trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceipts.map((receipt) => (
                    <TableRow key={`${receipt.type}-${receipt.id}`}>
                      <TableCell>
                        {format(new Date(receipt.date), "dd/MM/yyyy HH:mm", { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(receipt.type, receipt.subtype)}>
                          <span className="flex items-center gap-1">
                            {getTypeIcon(receipt.type, receipt.subtype)}
                            {getTypeLabel(receipt.type, receipt.subtype)}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{receipt.clientName}</p>
                          <p className="text-sm text-muted-foreground">{receipt.accountNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{receipt.reference}</TableCell>
                      <TableCell className="text-right font-medium">
                        {receipt.amount.toLocaleString()} GHT
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReceipt(receipt)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reçu</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <div className="bg-white text-black p-6 border rounded-lg" style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: "13px" }}>
                <div className="border-2 border-black mx-auto mb-3 px-4 py-2 text-center" style={{ maxWidth: "200px" }}>
                  <h3 className="text-base font-bold uppercase tracking-wide">Jaune Multi Services</h3>
                </div>
                <div className="text-center mb-4">
                  <p className="text-sm">{format(new Date(selectedReceipt.date), "EEE dd/MM/yyyy HH:mm", { locale: fr })}</p>
                </div>
                <div className="border-t border-dashed border-gray-400 my-3" />
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Référence:</span>
                    <span className="font-mono">{selectedReceipt.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold">{getTypeLabel(selectedReceipt.type, selectedReceipt.subtype)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Client:</span>
                    <span>{selectedReceipt.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">N° Compte:</span>
                    <span className="font-mono">{selectedReceipt.accountNumber}</span>
                  </div>
                  {selectedReceipt.description && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Description:</span>
                      <span>{selectedReceipt.description}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-dashed border-gray-400 my-3" />
                <div className="flex justify-between font-bold text-base py-1">
                  <span>MONTANT:</span>
                  <span>{selectedReceipt.amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} HTG</span>
                </div>
                <div className="border-t border-dashed border-gray-400 my-3" />
                <div className="text-center text-xs text-gray-500">
                  <p>Merci pour votre confiance</p>
                </div>
              </div>
              <Button onClick={handlePrint} className="w-full">
                <Printer className="mr-2 h-4 w-4" />
                Imprimer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiptsHistory;
