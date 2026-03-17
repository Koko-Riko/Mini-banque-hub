
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useBanking } from "@/contexts/BankingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, BanknoteIcon, Calendar, Check, CreditCard, PiggyBank } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Schéma de validation pour le formulaire de prêt
const loanSchema = z.object({
  accountId: z.string({
    required_error: "Veuillez sélectionner un compte",
  }),
  amount: z.string()
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Le montant doit être un nombre valide",
    })
    .refine((val) => parseFloat(val) > 0, {
      message: "Le montant doit être supérieur à 0",
    }),
  interestRate: z.string()
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Le taux d'intérêt doit être un nombre valide",
    })
    .refine((val) => parseFloat(val) >= 0 && parseFloat(val) <= 100, {
      message: "Le taux d'intérêt doit être compris entre 0 et 100",
    }),
  startDate: z.string({
    required_error: "Veuillez sélectionner une date de début",
  }),
  dueDate: z.string({
    required_error: "Veuillez sélectionner une date d'échéance",
  }),
}).refine(
  (data) => {
    if (!data.startDate || !data.dueDate) return true;
    return new Date(data.dueDate) > new Date(data.startDate);
  },
  {
    message: "La date d'échéance doit être postérieure à la date de début",
    path: ["dueDate"], // Spécifie que l'erreur concerne le champ dueDate
  }
);

type LoanFormValues = z.infer<typeof loanSchema>;

const NewLoan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { accounts, createLoan } = useBanking();
  const preSelectedAccountId = searchParams.get("accountId");

  const today = new Date().toISOString().split("T")[0];
  
  // Date d'échéance par défaut: 1 an après aujourd'hui
  const defaultDueDate = new Date();
  defaultDueDate.setFullYear(defaultDueDate.getFullYear() + 1);
  const defaultDueDateStr = defaultDueDate.toISOString().split("T")[0];

  // Initialiser le formulaire avec les valeurs par défaut
  const form = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      accountId: preSelectedAccountId || "",
      amount: "",
      interestRate: "5.0",
      startDate: today,
      dueDate: defaultDueDateStr,
    },
  });

  // Fonction pour soumettre le formulaire
  const onSubmit = async (data: LoanFormValues) => {
    const selectedAccount = accounts.find(account => account.id === data.accountId);
    
    if (!selectedAccount) {
      toast.error("Compte introuvable");
      return;
    }

    try {
      await createLoan({
        accountId: data.accountId,
        clientName: selectedAccount.clientName,
        amount: parseFloat(data.amount),
        interestRate: parseFloat(data.interestRate),
        startDate: data.startDate,
        dueDate: data.dueDate,
      });

      navigate(`/accounts/${data.accountId}`);
    } catch (error) {
      // Error already handled in createLoan
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Nouveau prêt</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du prêt</CardTitle>
          <CardDescription>
            Créez un nouveau prêt pour un compte client existant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compte client</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un compte" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.clientName} - {account.accountNumber} ({account.balance.toFixed(2)} €)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Sélectionnez le compte client qui recevra le prêt
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant du prêt (€)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <BanknoteIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <Input 
                            placeholder="5000" 
                            {...field} 
                            className="pl-10" 
                            type="number"
                            step="0.01"
                            min="0"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Entrez le montant total du prêt
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taux d'intérêt (%)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <PiggyBank className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <Input 
                            placeholder="5.0" 
                            {...field} 
                            className="pl-10" 
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Entrez le taux d'intérêt annuel
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de début</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <Input 
                            type="date" 
                            {...field} 
                            className="pl-10" 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Date à laquelle le prêt commence
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date d'échéance</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <Input 
                            type="date" 
                            {...field} 
                            className="pl-10" 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Date à laquelle le prêt doit être remboursé
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" className="flex-1 sm:flex-none sm:min-w-32">
                  <Check className="mr-2 h-4 w-4" />
                  Créer le prêt
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                  className="flex-1 sm:flex-none"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewLoan;
