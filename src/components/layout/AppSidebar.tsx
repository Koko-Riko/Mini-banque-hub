
import React from "react";
import bankLogo from "@/assets/bank-logo.svg";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem } from
"@/components/ui/sidebar";
import {
  Home,
  Users,
  CreditCard,
  FileText,
  ArrowUpDown,
  PiggyBank,
  Settings,
  Building,
  Search,
  Receipt,
  BarChart3,
  Shield } from
"lucide-react";
import { SidebarButton } from "@/utils/fixes";

export const AppSidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const adminMenuItems = [
  { title: "Tableau de bord", url: "/", icon: Home },
  { title: "Historique Reçus", url: "/receipts", icon: Receipt },
  { title: "Comptes Clients", url: "/accounts", icon: CreditCard },
  { title: "Transactions", url: "/transactions", icon: ArrowUpDown },
  { title: "Prêts", url: "/loans", icon: PiggyBank },
  { title: "Rapports", url: "/reports", icon: BarChart3 },
  { title: "Journal d'audit", url: "/audit-logs", icon: Shield },
  { title: "Paramètres", url: "/settings", icon: Settings }];


  const cashierMenuItems = [
  { title: "Tableau de bord", url: "/", icon: Home },
  { title: "Historique Reçus", url: "/receipts", icon: Receipt },
  { title: "Comptes Clients", url: "/accounts", icon: CreditCard },
  { title: "Transactions", url: "/transactions", icon: ArrowUpDown },
  { title: "Prêts", url: "/loans", icon: PiggyBank },
  { title: "Rapports", url: "/reports", icon: BarChart3 }];


  const menuItems = user?.role === "admin" ? adminMenuItems : cashierMenuItems;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-4 py-10" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) =>
              <SidebarMenuItem key={item.title}>
                  <SidebarButton
                  asChild
                  active={location.pathname === item.url || location.pathname.startsWith(`${item.url}/`)}>
                  
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Actions rapides</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarButton asChild>
                  <Link to="/accounts/new" className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4" />
                    <span>Nouveau compte</span>
                  </Link>
                </SidebarButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarButton asChild>
                  <Link to="/transactions/new" className="flex items-center gap-3">
                    <ArrowUpDown className="w-4 h-4" />
                    <span>Nouvelle transaction</span>
                  </Link>
                </SidebarButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarButton asChild>
                  <Link to="/loans/new" className="flex items-center gap-3">
                    <PiggyBank className="w-4 h-4" />
                    <span>Nouveau prêt</span>
                  </Link>
                </SidebarButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarButton asChild>
                  <Link to="/search" className="flex items-center gap-3">
                    <Search className="w-4 h-4" />
                    <span>Rechercher</span>
                  </Link>
                </SidebarButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>);

};