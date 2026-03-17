
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ActivitySelectorProps {
  activity: string;
  handleSelectChange: (name: string, value: string) => void;
}

export const ActivitySelector: React.FC<ActivitySelectorProps> = ({ 
  activity, 
  handleSelectChange 
}) => (
  <div className="space-y-2">
    <Label htmlFor="activity">Activité</Label>
    <Select 
      value={activity || "salarie"} 
      onValueChange={(value) => handleSelectChange('activity', value)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Sélectionner une activité" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="salarie">Salarié</SelectItem>
        <SelectItem value="etudiant">Étudiant</SelectItem>
        <SelectItem value="ecolier">Écolier</SelectItem>
        <SelectItem value="autonome">Travail Autonome</SelectItem>
      </SelectContent>
    </Select>
  </div>
);
