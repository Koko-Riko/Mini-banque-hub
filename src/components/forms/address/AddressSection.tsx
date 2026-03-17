
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const AddressSection = ({ formData, handleChange }: { 
  formData: any, 
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void 
}) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Adresse</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          name="address"
          placeholder="Numéro et nom de rue"
          value={formData.address}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">Ville</Label>
        <Input
          id="city"
          name="city"
          placeholder="Ville"
          value={formData.city}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="postalCode">Code postal</Label>
        <Input
          id="postalCode"
          name="postalCode"
          placeholder="Code postal"
          value={formData.postalCode}
          onChange={handleChange}
        />
      </div>
    </div>
  </div>
);
