import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { OfflineIndicator } from "./OfflineIndicator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, Clock, LogOut } from "lucide-react";
import bankLogo from "@/assets/bank-logo.svg";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface AppLayoutProps {
  requireAuth?: boolean;
  allowedRoles?: string[];
}

export const AppLayout = ({
  requireAuth = true,
  allowedRoles = []
}: AppLayoutProps) => {
  const {
    user,
    isAuthenticated,
    logout
  } = useAuth();
  const location = useLocation();
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [branchName, setBranchName] = useState<string | null>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch branch name if user has a branchId
  useEffect(() => {
    const fetchBranchName = async () => {
      if (user?.branchId) {
        const { data } = await supabase.
        from("branches").
        select("name, code").
        eq("id", user.branchId).
        maybeSingle();

        if (data) {
          setBranchName(`${data.name} (${data.code})`);
        }
      } else {
        setBranchName(null);
      }
    };

    fetchBranchName();
  }, [user?.branchId]);

  // Get current page name from route
  const getPageName = () => {
    const path = location.pathname;
    if (path === "/") return "Tableau de bord";
    if (path.startsWith("/accounts")) return "Comptes clients";
    if (path.startsWith("/transactions")) return "Transactions";
    if (path.startsWith("/loans")) return "Prêts";
    if (path.startsWith("/admin")) return "Administration";
    return "Page";
  };

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAuth && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {isAuthenticated &&
          <header className="h-16 border-b flex items-center justify-between px-6 fixed top-0 right-0 left-0 z-50 border-secondary shadow-lg bg-slate-50">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <img src={bankLogo} alt="Bank of la Gonâve" className="w-9 h-9 rounded-lg bg-white/90 p-0.5" />
                  <h1 className="text-xl font-bold text-primary">Bank of la Gonâve</h1>
                </div>
                <div className="h-6 w-px bg-border mx-2" />
                <span className="text-sm text-muted-foreground">{getPageName()}</span>
              </div>
              
              <div className="flex items-center gap-6">
                <OfflineIndicator />
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <time>
                    {format(currentTime, "EEEE d MMMM yyyy • HH:mm:ss", {
                    locale: fr
                  })}
                  </time>
                </div>

                {user &&
              <div className="flex items-center gap-4">
              <div className="text-sm flex items-center gap-3">
                      <Avatar className="h-8 w-8 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>{" "}
                      {user.isGeneralAdmin ?
                  <Badge variant="default" className="bg-green-600">
                          Admin Général
                        </Badge> :

                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role === "admin" ? "Admin" : "Caissier"}
                        </Badge>
                  }
                      {branchName &&
                  <Badge variant="outline" className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {branchName}
                        </Badge>
                  }
                    </div>
                    <Button variant="ghost" size="icon" onClick={logout}>
                      <LogOut size={18} />
                    </Button>
                  </div>
              }
              </div>
            </header>
          }
          <main className="flex-1 p-6 mt-16">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>);

};