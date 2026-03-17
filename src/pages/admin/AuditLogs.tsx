import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Search, ChevronLeft, ChevronRight, Eye, Filter } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: any;
  new_data: any;
  success: boolean | null;
  created_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  error_message: string | null;
}

const PAGE_SIZE = 20;

const actionColors: Record<string, string> = {
  INSERT: "bg-green-100 text-green-800 border-green-200",
  UPDATE: "bg-blue-100 text-blue-800 border-blue-200",
  DELETE: "bg-red-100 text-red-800 border-red-200",
};

const actionLabels: Record<string, string> = {
  INSERT: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
};

const tableLabels: Record<string, string> = {
  accounts: "Comptes",
  transactions: "Transactions",
  loans: "Prêts",
  loan_payments: "Paiements prêt",
  user_roles: "Rôles utilisateurs",
  branches: "Succursales",
  bank_info: "Info banque",
  profiles: "Profils",
  reports: "Rapports",
};

const AuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterTable, setFilterTable] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchLogs();
  }, [page, filterAction, filterTable]);

  const fetchLogs = async () => {
    setLoading(true);
    let query = supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (filterAction !== "all") {
      query = query.eq("action", filterAction);
    }
    if (filterTable !== "all") {
      query = query.eq("table_name", filterTable);
    }

    const { data, count, error } = await query;

    if (!error && data) {
      setLogs(data);
      setTotalCount(count || 0);

      // Fetch user names for all unique user_ids
      const userIds = [...new Set(data.map((l) => l.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, email")
        .in("user_id", userIds);

      if (profiles) {
        const names: Record<string, string> = {};
        profiles.forEach((p) => {
          names[p.user_id] = p.name || p.email || p.user_id.slice(0, 8);
        });
        setUserNames(names);
      }
    }
    setLoading(false);
  };

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const filteredLogs = searchTerm
    ? logs.filter(
        (l) =>
          (userNames[l.user_id] || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.record_id?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : logs;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-xl font-bold tracking-tight">Journal d'audit</h1>
          <p className="text-muted-foreground">
            Suivi de toutes les actions sensibles effectuées dans le système
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par utilisateur, table..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterAction} onValueChange={(v) => { setFilterAction(v); setPage(0); }}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes actions</SelectItem>
                <SelectItem value="INSERT">Création</SelectItem>
                <SelectItem value="UPDATE">Modification</SelectItem>
                <SelectItem value="DELETE">Suppression</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTable} onValueChange={(v) => { setFilterTable(v); setPage(0); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Table" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les tables</SelectItem>
                {Object.entries(tableLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Chargement...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">Aucun enregistrement trouvé</div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Détails</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs whitespace-nowrap">
                          {log.created_at
                            ? format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: fr })
                            : "-"}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {userNames[log.user_id] || log.user_id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={actionColors[log.action] || ""}>
                            {actionLabels[log.action] || log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {tableLabels[log.table_name] || log.table_name}
                        </TableCell>
                        <TableCell>
                          {log.success === false ? (
                            <Badge variant="destructive">Échec</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Succès</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  {totalCount} entrée{totalCount > 1 ? "s" : ""} au total
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {page + 1} / {Math.max(totalPages, 1)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Détails de l'événement
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {selectedLog.created_at
                        ? format(new Date(selectedLog.created_at), "dd MMMM yyyy à HH:mm:ss", { locale: fr })
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Utilisateur</p>
                    <p className="font-medium">{userNames[selectedLog.user_id] || selectedLog.user_id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Action</p>
                    <Badge variant="outline" className={actionColors[selectedLog.action] || ""}>
                      {actionLabels[selectedLog.action] || selectedLog.action}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Table</p>
                    <p className="font-medium">{tableLabels[selectedLog.table_name] || selectedLog.table_name}</p>
                  </div>
                  {selectedLog.record_id && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">ID enregistrement</p>
                      <p className="font-mono text-xs">{selectedLog.record_id}</p>
                    </div>
                  )}
                  {selectedLog.error_message && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Erreur</p>
                      <p className="text-destructive text-sm">{selectedLog.error_message}</p>
                    </div>
                  )}
                </div>

                {selectedLog.action === "UPDATE" && selectedLog.old_data && selectedLog.new_data && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Changements détectés</p>
                    <div className="bg-muted rounded-md p-3 text-xs space-y-1 font-mono">
                      {Object.keys(selectedLog.new_data)
                        .filter((key) => JSON.stringify(selectedLog.old_data[key]) !== JSON.stringify(selectedLog.new_data[key]))
                        .map((key) => (
                          <div key={key} className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground font-semibold">{key}:</span>
                            <span className="text-red-600 line-through pl-3">{JSON.stringify(selectedLog.old_data[key])}</span>
                            <span className="text-green-600 pl-3">{JSON.stringify(selectedLog.new_data[key])}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {selectedLog.action === "INSERT" && selectedLog.new_data && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Données créées</p>
                    <pre className="bg-muted rounded-md p-3 text-xs font-mono overflow-auto whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.new_data, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.action === "DELETE" && selectedLog.old_data && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Données supprimées</p>
                    <pre className="bg-muted rounded-md p-3 text-xs font-mono overflow-auto whitespace-pre-wrap text-red-600">
                      {JSON.stringify(selectedLog.old_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditLogs;
