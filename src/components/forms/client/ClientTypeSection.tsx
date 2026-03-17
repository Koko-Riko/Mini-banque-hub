
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const ClientTypeSection = ({ handleSelectChange }: { 
  handleSelectChange: (name: string, value: string) => void 
}) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Type de client</h3>
    <div className="w-full">
      <Select 
        onValueChange={(value) => handleSelectChange("clientType", value)}
        defaultValue="particulier"
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionnez le type de client" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="particulier">Particulier</SelectItem>
          <SelectItem value="entreprise">Entreprise</SelectItem>
          <SelectItem value="association">Association</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);
