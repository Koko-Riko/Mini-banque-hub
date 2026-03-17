import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Building2, CreditCard, PiggyBank, TrendingUp, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BranchStatsCard from "./BranchStatsCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface Branch {
  id: string;
  name: string;
  code: string;
}

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

interface GlobalStats {
  totalAccounts: number;
  totalBalance: number;
  totalDepositsToday: number;
  totalWithdrawalsToday: number;
  totalActiveLoans: number;
  totalLoanAmount: number;
  totalBranches: number;
}

interface DailyChartData {
  day: string;
  deposits: number;
  withdrawals: number;
}

const GeneralAdminDashboard: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchStats, setBranchStats] = useState<BranchStats[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<DailyChartData[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split("T")[0];

      // Charger les succursales
      const { data: branchesData } = await supabase
        .from("branches")
        .select("id, name, code")
        .eq("is_active", true);

      setBranches(branchesData || []);

      // Charger les comptes
      const { data: accountsData } = await supabase
        .from("accounts")
        .select("id, branch_id, balance, currency, status");

      // Charger les transactions d'aujourd'hui
      const { data: transactionsData } = await supabase
        .from("transactions")
        .select("id, account_id, type, amount, branch_id, created_at")
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`);

      // Charger les prêts actifs
      const { data: loansData } = await supabase
        .from("loans")
        .select("id, account_id, amount, status")
        .eq("status", "active");

      // Calculer les statistiques par succursale
      const stats: BranchStats[] = (branchesData || []).map((branch) => {
        const branchAccounts = (accountsData || []).filter(
          (a) => a.branch_id === branch.id && a.status === "active"
        );
        const branchTransactions = (transactionsData || []).filter(
          (t) => t.branch_id === branch.id
        );
        const branchAccountIds = branchAccounts.map((a) => a.id);
        const branchLoans = (loansData || []).filter((l) =>
          branchAccountIds.includes(l.account_id)
        );

        return {
          branchId: branch.id,
          branchName: branch.name,
          branchCode: branch.code,
          accountsCount: branchAccounts.length,
          totalBalance: branchAccounts.reduce((sum, a) => sum + Number(a.balance), 0),
          depositsToday: branchTransactions
            .filter((t) => t.type === "deposit")
            .reduce((sum, t) => sum + Number(t.amount), 0),
          withdrawalsToday: branchTransactions
            .filter((t) => t.type === "withdrawal")
            .reduce((sum, t) => sum + Number(t.amount), 0),
          activeLoansCount: branchLoans.length,
          currency: branchAccounts[0]?.currency || "HTG",
        };
      });

      setBranchStats(stats);

      // Calculer les statistiques globales
      const activeAccounts = (accountsData || []).filter((a) => a.status === "active");
      setGlobalStats({
        totalAccounts: activeAccounts.length,
        totalBalance: activeAccounts.reduce((sum, a) => sum + Number(a.balance), 0),
        totalDepositsToday: (transactionsData || [])
          .filter((t) => t.type === "deposit")
          .reduce((sum, t) => sum + Number(t.amount), 0),
        totalWithdrawalsToday: (transactionsData || [])
          .filter((t) => t.type === "withdrawal")
          .reduce((sum, t) => sum + Number(t.amount), 0),
        totalActiveLoans: (loansData || []).length,
        totalLoanAmount: (loansData || []).reduce((sum, l) => sum + Number(l.amount), 0),
        totalBranches: (branchesData || []).length,
      });

      // Charger les transactions des 7 derniers jours pour le graphique
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

      const { data: weeklyTransactions } = await supabase
        .from("transactions")
        .select("type, amount, created_at")
        .gte("created_at", `${sevenDaysAgoStr}T00:00:00`)
        .in("type", ["deposit", "withdrawal"]);

      const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
      const chartData: DailyChartData[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const dayLabel = `${dayNames[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
        const dayTxs = (weeklyTransactions || []).filter(
          (t) => t.created_at?.startsWith(dateStr)
        );
        chartData.push({
          day: dayLabel,
          deposits: dayTxs.filter((t) => t.type === "deposit").reduce((s, t) => s + Number(t.amount), 0),
          withdrawals: dayTxs.filter((t) => t.type === "withdrawal").reduce((s, t) => s + Number(t.amount), 0),
        });
      }
      setWeeklyData(chartData);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Vue d'ensemble globale
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comptes totaux</CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{globalStats?.totalAccounts || 0}</div>
              <p className="text-xs text-muted-foreground">
                Solde total: {globalStats?.totalBalance.toLocaleString("fr-FR")} HTG
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dépôts aujourd'hui</CardTitle>
              <ArrowDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {globalStats?.totalDepositsToday.toLocaleString("fr-FR")} HTG
              </div>
              <p className="text-xs text-muted-foreground">Toutes succursales</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retraits aujourd'hui</CardTitle>
              <ArrowUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {globalStats?.totalWithdrawalsToday.toLocaleString("fr-FR")} HTG
              </div>
              <p className="text-xs text-muted-foreground">Toutes succursales</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Graphique évolution 7 jours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Évolution des 7 derniers jours
          </CardTitle>
          <CardDescription>Dépôts et retraits quotidiens (HTG)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(v) => v.toLocaleString("fr-FR")} />
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString("fr-FR")} HTG`]}
                labelStyle={{ fontWeight: "bold" }}
              />
              <Legend />
              <Bar dataKey="deposits" name="Dépôts" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="withdrawals" name="Retraits" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prêts actifs</CardTitle>
            <PiggyBank className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats?.totalActiveLoans || 0}</div>
            <p className="text-xs text-muted-foreground">
              Montant total: {globalStats?.totalLoanAmount.toLocaleString("fr-FR")} HTG
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flux net aujourd'hui</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {globalStats && (
              <>
                <div
                  className={`text-2xl font-bold ${
                    globalStats.totalDepositsToday - globalStats.totalWithdrawalsToday >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(globalStats.totalDepositsToday - globalStats.totalWithdrawalsToday).toLocaleString(
                    "fr-FR"
                  )}{" "}
                  HTG
                </div>
                <p className="text-xs text-muted-foreground">Dépôts - Retraits</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistiques par succursale */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Statistiques par succursale
        </h2>
        {branchStats.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucune succursale configurée
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {branchStats.map((stats) => (
              <BranchStatsCard key={stats.branchId} stats={stats} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralAdminDashboard;
