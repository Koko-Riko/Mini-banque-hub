
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface GenderSelectorProps {
  gender: string;
  handleRadioChange: (value: string) => void;
}

export const GenderSelector: React.FC<GenderSelectorProps> = ({ 
  gender, 
  handleRadioChange 
}) => (
  <div className="space-y-2">
    <Label htmlFor="gender">Genre</Label>
    <RadioGroup 
      defaultValue="homme" 
      className="flex space-x-4"
      value={gender}
      onValueChange={handleRadioChange}
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="homme" id="homme" />
        <Label htmlFor="homme">Homme</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="femme" id="femme" />
        <Label htmlFor="femme">Femme</Label>
      </div>
    </RadioGroup>
  </div>
);
