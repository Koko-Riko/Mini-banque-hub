
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AccountInfoSection = ({
  formData,
  handleChange,
  handleSelectChange,
}: {
  formData: any,
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
  handleSelectChange: (name: string, value: string) => void,
}) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Informations du compte</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="accountNumber">Numéro de compte</Label>
        <Input
          id="accountNumber"
          name="accountNumber"
          placeholder="Généré automatiquement"
          value={formData.accountNumber}
          readOnly
          className="bg-muted cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">Le numéro sera généré automatiquement</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountType">Type de compte</Label>
        <Select 
          onValueChange={(value) => handleSelectChange("accountType", value)}
          defaultValue="courant"
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionnez le type de compte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="courant">Compte courant</SelectItem>
            <SelectItem value="epargne">Compte épargne</SelectItem>
            <SelectItem value="conjoint">Compte conjoint</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="balance">Solde initial</Label>
        <Input
          id="balance"
          name="balance"
          type="number"
          min="0"
          step="0.01"
          value={formData.balance}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Devise</Label>
        <Select 
          onValueChange={(value) => handleSelectChange("currency", value)}
          defaultValue="HTG"
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionnez une devise" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="HTG">🇭🇹 HTG (Gourdes)</SelectItem>
            <SelectItem value="USD">💵 USD (Dollars)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
);
