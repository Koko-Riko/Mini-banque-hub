
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User, Calendar, MapPin } from "lucide-react";

interface PersonalInfoFieldsProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const PersonalInfoFields: React.FC<PersonalInfoFieldsProps> = ({ 
  formData, 
  handleChange 
}) => (
  <>
    <div className="space-y-2">
      <Label htmlFor="lastName">Nom</Label>
      <div className="flex items-center space-x-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <Input
          id="lastName"
          name="lastName"
          placeholder="Nom de famille"
          value={formData.lastName || ""}
          onChange={handleChange}
          required
        />
      </div>
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="firstName">Prénom</Label>
      <div className="flex items-center space-x-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <Input
          id="firstName"
          name="firstName"
          placeholder="Prénom"
          value={formData.firstName || ""}
          onChange={handleChange}
          required
        />
      </div>
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="birthDate">Date de naissance</Label>
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <Input
          id="birthDate"
          name="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={handleChange}
          required
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="birthPlace">Lieu de naissance</Label>
      <div className="flex items-center space-x-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <Input
          id="birthPlace"
          name="birthPlace"
          placeholder="Lieu de naissance"
          value={formData.birthPlace || ""}
          onChange={handleChange}
        />
      </div>
    </div>
  </>
);
