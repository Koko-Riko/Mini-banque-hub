
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line } from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Building2, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface ReportData {
  date: string;
  totalTransactions: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalTransfers: number;
  newAccounts: number;
  newLoans: number;
}

const ReportsList = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData[]>([]);

  // Load branches for admin filter
  useEffect(() => {
    const loadBranches = async () => {
      if (!user?.isGeneralAdmin && user?.role !== "admin") return;
      
      const { data, error } = await supabase
        .from("branches")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");
      
      if (!error && data) {
        setBranches(data);
      }
    };
    
    loadBranches();
  }, [user]);

  // Load report data based on selected branch
  useEffect(() => {
    const loadReportData = async () => {
      setIsLoading(true);
      
      try {
        const endDate = new Date();
        const startDate = subDays(endDate, 6);
        
        // Build query for transactions
        let transactionsQuery = supabase
          .from("transactions")
          .select("type, amount, created_at, branch_id")
          .gte("created_at", format(startDate, "yyyy-MM-dd"))
          .lte("created_at", format(endDate, "yyyy-MM-dd") + "T23:59:59");
        
        // Build query for accounts
        let accountsQuery = supabase
          .from("accounts")
          .select("created_at, branch_id")
          .gte("created_at", format(startDate, "yyyy-MM-dd"))
          .lte("created_at", format(endDate, "yyyy-MM-dd") + "T23:59:59");
        
        // Build query for loans
        let loansQuery = supabase
          .from("loans")
          .select("created_at, account_id, accounts!inner(branch_id)")
          .gte("created_at", format(startDate, "yyyy-MM-dd"))
          .lte("created_at", format(endDate, "yyyy-MM-dd") + "T23:59:59");
        
        // Apply branch filter if selected
        if (selectedBranchId !== "all") {
          transactionsQuery = transactionsQuery.eq("branch_id", selectedBranchId);
          accountsQuery = accountsQuery.eq("branch_id", selectedBranchId);
          loansQuery = loansQuery.eq("accounts.branch_id", selectedBranchId);
        }
        
        const [transactionsRes, accountsRes, loansRes] = await Promise.all([
          transactionsQuery,
          accountsQuery,
          loansQuery
        ]);
        
        // Process data for each day
        const dailyData: ReportData[] = Array(7).fill(0).map((_, index) => {
          const date = format(subDays(new Date(), 6 - index), "yyyy-MM-dd");
          
          // Filter transactions for this day
          const dayTransactions = (transactionsRes.data || []).filter(t => 
            t.created_at.startsWith(date)
          );
          
          const deposits = dayTransactions
            .filter(t => t.type === "deposit")
            .reduce((sum, t) => sum + Number(t.amount), 0);
          
          const withdrawals = dayTransactions
            .filter(t => t.type === "withdrawal")
            .reduce((sum, t) => sum + Number(t.amount), 0);
          
          const transfers = dayTransactions
            .filter(t => t.type === "transfer")
            .reduce((sum, t) => sum + Number(t.amount), 0);
          
          // Count new accounts for this day
          const newAccounts = (accountsRes.data || []).filter(a => 
            a.created_at.startsWith(date)
          ).length;
          
          // Count new loans for this day
          const newLoans = (loansRes.data || []).filter(l => 
            l.created_at.startsWith(date)
          ).length;
          
          return {
            date,
            totalTransactions: dayTransactions.length,
            totalDeposits: deposits,
            totalWithdrawals: withdrawals,
            totalTransfers: transfers,
            newAccounts,
            newLoans
          };
        });
        
        setReportData(dailyData);
      } catch (error) {
        console.error("Error loading report data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReportData();
  }, [selectedBranchId]);

  // Format data for charts
  const last7DaysData = reportData.map(report => ({
    date: format(new Date(report.date), "dd/MM", { locale: fr }),
    transactions: report.totalTransactions,
    dépôts: report.totalDeposits,
    retraits: report.totalWithdrawals,
    virements: report.totalTransfers,
    comptes: report.newAccounts,
    prêts: report.newLoans
  }));

  // Get today's report
  const todayFormatted = format(new Date(), "yyyy-MM-dd");
  const todayReport = reportData.find(r => r.date === todayFormatted) || {
    date: todayFormatted,
    totalTransactions: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalTransfers: 0,
    newAccounts: 0,
    newLoans: 0
  };

  // Get selected day's report
  const selectedDateFormatted = selectedDate ? format(selectedDate, "yyyy-MM-dd") : todayFormatted;
  const selectedReport = reportData.find(r => r.date === selectedDateFormatted) || {
    date: selectedDateFormatted,
    totalTransactions: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalTransfers: 0,
    newAccounts: 0,
    newLoans: 0
  };

  const chartConfig = {
    transactions: { label: "Transactions" },
    dépôts: { label: "Dépôts", color: "#4ade80" },
    retraits: { label: "Retraits", color: "#f43f5e" },
    virements: { label: "Virements", color: "#3b82f6" },
    comptes: { label: "Nouveaux Comptes", color: "#a855f7" },
    prêts: { label: "Nouveaux Prêts", color: "#f59e0b" },
  };

  const canFilterByBranch = user?.isGeneralAdmin || (user?.role === "admin" && !user?.branchId);

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Rapports</h1>
          <p className="text-muted-foreground">
            Analysez les activités bancaires et les performances
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {canFilterByBranch && branches.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                <SelectTrigger className="w-[200px]">
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Toutes les succursales" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les succursales</SelectItem>
                  {branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} ({branch.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-medium">Données au {format(new Date(), "dd MMMM yyyy", { locale: fr })}</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="accounts">Comptes & Prêts</TabsTrigger>
            <TabsTrigger value="details">Détails journaliers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Total des transactions</CardTitle>
                  <CardDescription>Aujourd'hui</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayReport.totalTransactions}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {todayReport.totalDeposits.toLocaleString()} HTG en dépôts • {todayReport.totalWithdrawals.toLocaleString()} HTG en retraits
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Nouveaux comptes</CardTitle>
                  <CardDescription>Aujourd'hui</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayReport.newAccounts}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    nouveaux comptes créés
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Nouveaux prêts</CardTitle>
                  <CardDescription>Aujourd'hui</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{todayReport.newLoans}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    nouveaux prêts accordés
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Activité des 7 derniers jours</CardTitle>
                <CardDescription>
                  Vue d'ensemble des transactions et activités
                  {selectedBranchId !== "all" && branches.find(b => b.id === selectedBranchId) && (
                    <span className="ml-2 text-primary font-medium">
                      • {branches.find(b => b.id === selectedBranchId)?.name}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="aspect-[4/2]">
                  <BarChart data={last7DaysData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend />
                    <Bar dataKey="transactions" fill="#6366f1" name="Transactions" />
                    <Bar dataKey="dépôts" fill="#4ade80" name="Dépôts" />
                    <Bar dataKey="retraits" fill="#f43f5e" name="Retraits" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Évolution des transactions</CardTitle>
                <CardDescription>
                  Tendances des 7 derniers jours
                  {selectedBranchId !== "all" && branches.find(b => b.id === selectedBranchId) && (
                    <span className="ml-2 text-primary font-medium">
                      • {branches.find(b => b.id === selectedBranchId)?.name}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="aspect-[4/2]">
                  <LineChart data={last7DaysData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend />
                    <Line 
                      type="monotone" 
                      dataKey="dépôts"
                      stroke="#4ade80"
                      strokeWidth={2} 
                      name="Dépôts"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="retraits"
                      stroke="#f43f5e"
                      strokeWidth={2} 
                      name="Retraits"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="virements"
                      stroke="#3b82f6"
                      strokeWidth={2} 
                      name="Virements"
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Dépôts totaux</CardTitle>
                  <CardDescription>7 derniers jours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {last7DaysData.reduce((total, day) => total + (day.dépôts || 0), 0).toLocaleString()} HTG
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Retraits totaux</CardTitle>
                  <CardDescription>7 derniers jours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    {last7DaysData.reduce((total, day) => total + (day.retraits || 0), 0).toLocaleString()} HTG
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Virements totaux</CardTitle>
                  <CardDescription>7 derniers jours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">
                    {last7DaysData.reduce((total, day) => total + (day.virements || 0), 0).toLocaleString()} HTG
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Création de comptes et prêts</CardTitle>
                <CardDescription>
                  Tendances des 7 derniers jours
                  {selectedBranchId !== "all" && branches.find(b => b.id === selectedBranchId) && (
                    <span className="ml-2 text-primary font-medium">
                      • {branches.find(b => b.id === selectedBranchId)?.name}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="aspect-[4/2]">
                  <LineChart data={last7DaysData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend />
                    <Line 
                      type="monotone" 
                      dataKey="comptes"
                      stroke="#a855f7"
                      strokeWidth={2} 
                      name="Nouveaux Comptes"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="prêts"
                      stroke="#f59e0b"
                      strokeWidth={2} 
                      name="Nouveaux Prêts"
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Total de nouveaux comptes</CardTitle>
                  <CardDescription>7 derniers jours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-500">
                    {last7DaysData.reduce((total, day) => total + (day.comptes || 0), 0)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    nouveaux clients ajoutés
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Total de nouveaux prêts</CardTitle>
                  <CardDescription>7 derniers jours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-500">
                    {last7DaysData.reduce((total, day) => total + (day.prêts || 0), 0)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    prêts accordés
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium mb-2">Sélectionner une date</h3>
                <Card>
                  <CardContent className="pt-6">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      locale={fr}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                <h3 className="font-medium mb-2">
                  Rapport du {selectedDate ? format(selectedDate, "dd MMMM yyyy", {locale: fr}) : "jour sélectionné"}
                  {selectedBranchId !== "all" && branches.find(b => b.id === selectedBranchId) && (
                    <span className="ml-2 text-primary font-normal text-sm">
                      ({branches.find(b => b.id === selectedBranchId)?.name})
                    </span>
                  )}
                </h3>
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Catégorie</TableHead>
                          <TableHead className="text-right">Valeur</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Total des transactions</TableCell>
                          <TableCell className="text-right font-medium">{selectedReport.totalTransactions}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Dépôts</TableCell>
                          <TableCell className="text-right font-medium text-green-600">{selectedReport.totalDeposits.toLocaleString()} HTG</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Retraits</TableCell>
                          <TableCell className="text-right font-medium text-red-600">{selectedReport.totalWithdrawals.toLocaleString()} HTG</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Virements</TableCell>
                          <TableCell className="text-right font-medium text-blue-600">{selectedReport.totalTransfers.toLocaleString()} HTG</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Nouveaux comptes</TableCell>
                          <TableCell className="text-right font-medium text-purple-600">{selectedReport.newAccounts}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Nouveaux prêts</TableCell>
                          <TableCell className="text-right font-medium text-amber-600">{selectedReport.newLoans}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ReportsList;
