import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UserPlus, Trash2, Shield, User, Pencil, UserCheck, UserX } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { z } from "zod";
import { sanitizeError } from "@/lib/errorHandler";

const userCreationSchema = z.object({
  email: z.string().trim().email("Format d'email invalide").max(255, "Email trop long"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").max(128, "Mot de passe trop long"),
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100, "Nom trop long"),
  role: z.enum(["admin", "cashier"]),
  branch_id: z.string().optional(),
}).refine((data) => {
  // Cashiers must have a branch assigned
  if (data.role === "cashier") {
    return data.branch_id && data.branch_id.length > 0;
  }
  return true;
}, {
  message: "Les caissiers doivent être affectés à une succursale",
  path: ["branch_id"],
});

interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: string;
  branch_id: string | null;
  branch_name?: string;
  created_at: string;
  is_active?: boolean;
}

interface Branch {
  id: string;
  name: string;
  code: string;
}

export const UsersManagementTab = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    name: "",
    role: "cashier",
    branch_id: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    const { data, error } = await supabase
      .from("branches")
      .select("id, name, code")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching branches:", error);
      return;
    }
    setBranches(data || []);
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, name, email, created_at, is_active");

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role, branch_id");

      if (rolesError) throw rolesError;

      const { data: branchesData } = await supabase
        .from("branches")
        .select("id, name");

      const branchMap = new Map(branchesData?.map(b => [b.id, b.name]) || []);

      const usersWithRoles = profiles?.map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          id: profile.user_id,
          email: profile.email || "",
          name: profile.name || "",
          role: userRole?.role || "cashier",
          branch_id: userRole?.branch_id || null,
          branch_name: userRole?.branch_id ? branchMap.get(userRole.branch_id) : undefined,
          created_at: profile.created_at || "",
          is_active: profile.is_active ?? true,
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const validatedData = userCreationSchema.parse(newUser);
      
      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: { name: validatedData.name },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Update role and branch if needed
        if (newUser.role === "admin" || newUser.branch_id) {
          const { error: roleError } = await supabase
            .from("user_roles")
            .update({ 
              role: newUser.role as "admin" | "cashier",
              branch_id: newUser.branch_id || null 
            })
            .eq("user_id", data.user.id);

          if (roleError) console.error("Error updating role:", roleError);
        }

        toast.success("Utilisateur créé avec succès");
        setIsDialogOpen(false);
        setNewUser({ email: "", password: "", name: "", role: "cashier", branch_id: "" });
        fetchUsers();
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Error creating user:", error);
        toast.error(sanitizeError(error));
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc("delete_user_account", {
        user_id_to_delete: userId,
      });

      if (error) throw error;

      toast.success("Utilisateur supprimé avec succès");
      fetchUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(sanitizeError(error));
    }
  };

  const handleEditUser = (user: UserWithRole) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    // Validate: cashiers must have a branch
    if (editingUser.role === "cashier" && !editingUser.branch_id) {
      toast.error("Les caissiers doivent être affectés à une succursale");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ 
          role: editingUser.role as "admin" | "cashier",
          branch_id: editingUser.branch_id || null 
        })
        .eq("user_id", editingUser.id);

      if (error) throw error;

      toast.success("Utilisateur mis à jour avec succès");
      setIsEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(sanitizeError(error));
    }
  };

  const handleToggleActive = async (user: UserWithRole) => {
    const newStatus = !user.is_active;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: newStatus })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success(`Utilisateur ${newStatus ? 'activé' : 'désactivé'}`);
      setUsers(users.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
    } catch (error: any) {
      console.error("Error toggling user status:", error);
      toast.error(sanitizeError(error));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gestion des Utilisateurs</CardTitle>
          <CardDescription>
            Créez et gérez les comptes utilisateurs et leurs rôles
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nouvel utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un utilisateur</DialogTitle>
              <DialogDescription>
                Ajoutez un nouvel utilisateur au système
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="jean@example.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label htmlFor="role">Rôle</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashier">Caissier</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="branch">
                  Succursale {newUser.role === "cashier" && <span className="text-destructive">*</span>}
                </Label>
                <Select
                  value={newUser.branch_id || "none"}
                  onValueChange={(value) => setNewUser({ ...newUser, branch_id: value === "none" ? "" : value })}
                >
                  <SelectTrigger className={newUser.role === "cashier" && !newUser.branch_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionner une succursale" />
                  </SelectTrigger>
                  <SelectContent>
                    {newUser.role === "admin" && <SelectItem value="none">Aucune (Admin général)</SelectItem>}
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name} ({branch.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {newUser.role === "cashier" && !newUser.branch_id && (
                  <p className="text-sm text-destructive mt-1">Obligatoire pour les caissiers</p>
                )}
                {newUser.role === "admin" && !newUser.branch_id && (
                  <p className="text-sm text-muted-foreground mt-1">Admin général: accès à toutes les succursales</p>
                )}
              </div>
              <Button onClick={handleCreateUser} className="w-full">
                Créer l'utilisateur
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Succursale</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className={!user.is_active ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? (
                        <><Shield className="mr-1 h-3 w-3" /> Admin</>
                      ) : (
                        <><User className="mr-1 h-3 w-3" /> Caissier</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.branch_name || "-"}</TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditUser(user)}
                            >
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Éditer</TooltipContent>
                        </Tooltip>

                        <AlertDialog>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  {user.is_active ? (
                                    <UserX className="h-4 w-4 text-orange-500" />
                                  ) : (
                                    <UserCheck className="h-4 w-4 text-green-500" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                              {user.is_active ? "Désactiver" : "Activer"}
                            </TooltipContent>
                          </Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {user.is_active ? "Désactiver l'utilisateur" : "Activer l'utilisateur"}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {user.is_active 
                                  ? `Êtes-vous sûr de vouloir désactiver ${user.name} ? L'utilisateur ne pourra plus se connecter.`
                                  : `Êtes-vous sûr de vouloir activer ${user.name} ? L'utilisateur pourra à nouveau se connecter.`
                                }
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleToggleActive(user)}>
                                {user.is_active ? "Désactiver" : "Activer"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Supprimer</TooltipContent>
                          </Tooltip>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer cet utilisateur ?
                                Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez le rôle et la succursale de {editingUser?.name}
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={editingUser.email} disabled className="bg-muted" />
              </div>
              <div>
                <Label htmlFor="edit-role">Rôle</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashier">Caissier</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-branch">
                  Succursale {editingUser.role === "cashier" && <span className="text-destructive">*</span>}
                </Label>
                <Select
                  value={editingUser.branch_id || "none"}
                  onValueChange={(value) => setEditingUser({ ...editingUser, branch_id: value === "none" ? null : value })}
                >
                  <SelectTrigger className={editingUser.role === "cashier" && !editingUser.branch_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionner une succursale" />
                  </SelectTrigger>
                  <SelectContent>
                    {editingUser.role === "admin" && <SelectItem value="none">Aucune (Admin général)</SelectItem>}
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name} ({branch.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editingUser.role === "cashier" && !editingUser.branch_id && (
                  <p className="text-sm text-destructive mt-1">Obligatoire pour les caissiers</p>
                )}
                {editingUser.role === "admin" && !editingUser.branch_id && (
                  <p className="text-sm text-muted-foreground mt-1">Admin général: accès à toutes les succursales</p>
                )}
              </div>
              <Button onClick={handleSaveEdit} className="w-full">
                Enregistrer les modifications
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
