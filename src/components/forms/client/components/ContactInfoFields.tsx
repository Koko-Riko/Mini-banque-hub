
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ContactInfoFieldsProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const ContactInfoFields: React.FC<ContactInfoFieldsProps> = ({ 
  formData, 
  handleChange 
}) => (
  <>
    <div className="space-y-2">
      <Label htmlFor="phone">Téléphone</Label>
      <Input
        id="phone"
        name="phone"
        placeholder="+33 6 12 34 56 78"
        value={formData.phone}
        onChange={handleChange}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="email">Email (facultatif)</Label>
      <Input
        id="email"
        name="email"
        type="email"
        placeholder="exemple@domaine.com"
        value={formData.email}
        onChange={handleChange}
      />
    </div>
  </>
);
