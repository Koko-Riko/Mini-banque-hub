import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, ArrowDown, ArrowUp, PiggyBank } from "lucide-react";

interface BranchStats {
  branchId: string;
  branchName: string;
  branchCode: string;
  accountsCount: number;
  totalBalance: number;
  depositsToday: number;
  withdrawalsToday: number;
  activeLoansCount: number;
  currency: string;
}

interface BranchStatsCardProps {
  stats: BranchStats;
}

const BranchStatsCard: React.FC<BranchStatsCardProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    const symbol = stats.currency === "USD" ? "$" : "HTG";
    return `${amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} ${symbol}`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{stats.branchName}</CardTitle>
          <span className="text-xs text-muted-foreground">({stats.branchCode})</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Comptes</p>
              <p className="font-semibold">{stats.accountsCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Prêts actifs</p>
              <p className="font-semibold">{stats.activeLoansCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowDown className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Dépôts (aujourd'hui)</p>
              <p className="font-semibold text-green-600">{formatCurrency(stats.depositsToday)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUp className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Retraits (aujourd'hui)</p>
              <p className="font-semibold text-red-600">{formatCurrency(stats.withdrawalsToday)}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t">
          <p className="text-sm text-muted-foreground">Solde total</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(stats.totalBalance)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BranchStatsCard;
