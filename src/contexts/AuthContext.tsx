
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types/auth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeError } from "@/lib/errorHandler";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Vérifier la session au chargement initial
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserData(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de session:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();

    // Configurer l'écouteur d'événements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserData(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const setUserData = async (authUser: any) => {
    try {
      // Récupérer le profil et le rôle depuis la base de données
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, is_active')
        .eq('user_id', authUser.id)
        .maybeSingle();

      // Vérifier si l'utilisateur est désactivé
      if (profile && profile.is_active === false) {
        await supabase.auth.signOut();
        setUser(null);
        toast.error("Votre compte a été désactivé. Contactez un administrateur.");
        return;
      }

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role, branch_id')
        .eq('user_id', authUser.id)
        .maybeSingle();
      
      // Un admin général est un admin sans branch_id
      const isGeneralAdmin = userRole?.role === 'admin' && !userRole?.branch_id;
      
      // Créer l'objet utilisateur
      const userData: User = {
        id: authUser.id,
        name: profile?.name || authUser.email.split('@')[0],
        username: authUser.email,
        role: (userRole?.role || 'cashier') as "admin" | "cashier",
        branchId: userRole?.branch_id || null,
        isGeneralAdmin
      };
      
      setUser(userData);
    } catch (error) {
      console.error("Erreur lors de la récupération des données utilisateur:", error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error("Email ou mot de passe incorrect");
        return false;
      }

      if (data.user) {
        setUserData(data.user);
        toast.success(`Bienvenue !`);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Exception lors de la connexion:", error);
      toast.error("Une erreur est survenue");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: name
          }
        }
      });

      if (error) {
        toast.error(sanitizeError(error));
        return false;
      }

      if (data.user) {
        toast.success("Compte créé avec succès !");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Exception lors de l'inscription:", error);
      toast.error("Une erreur est survenue");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.info("Vous avez été déconnecté");
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
