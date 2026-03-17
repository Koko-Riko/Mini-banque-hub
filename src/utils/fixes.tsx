
// Ce fichier contient des corrections pour compatibilité typographique
import React from "react";
import { Button } from "@/components/ui/button";

// Enveloppe pour Button avec une propriété "active" pour AppSidebar
export const SidebarButton = ({ 
  active, 
  children, 
  className,
  ...props 
}: React.ComponentProps<typeof Button> & { active?: boolean }) => {
  return (
    <Button 
      {...props} 
      variant={active ? "default" : "ghost"}
      className={`w-full justify-start ${active ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" : "hover:bg-secondary/20"} ${className || ""}`}
    >
      {children}
    </Button>
  );
};
