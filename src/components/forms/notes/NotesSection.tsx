
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const NotesSection = ({ formData, handleChange }: { 
  formData: any, 
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void 
}) => (
  <div className="space-y-2">
    <Label htmlFor="notes">Notes additionnelles</Label>
    <Textarea
      id="notes"
      name="notes"
      placeholder="Informations supplémentaires sur le client..."
      value={formData.notes}
      onChange={handleChange}
      className="min-h-24"
    />
  </div>
);
