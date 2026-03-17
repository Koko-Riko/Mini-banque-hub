
import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";

export const DocumentsSection = ({ 
  formData, 
  handleDocumentCheckboxChange,
  handleDocumentNumberChange
}: { 
  formData: any, 
  handleDocumentCheckboxChange: (document: string, checked: boolean) => void,
  handleDocumentNumberChange: (value: string) => void
}) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold mb-4">Documents d'identité</h3>
    
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="passport" 
          checked={formData.documents.passport} 
          onCheckedChange={(checked) => 
            handleDocumentCheckboxChange('passport', checked === true)
          }
        />
        <Label htmlFor="passport">Passeport</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="idCard" 
          checked={formData.documents.idCard} 
          onCheckedChange={(checked) => 
            handleDocumentCheckboxChange('idCard', checked === true)
          }
        />
        <Label htmlFor="idCard">Carte d'identité</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="drivingLicense" 
          checked={formData.documents.drivingLicense} 
          onCheckedChange={(checked) => 
            handleDocumentCheckboxChange('drivingLicense', checked === true)
          }
        />
        <Label htmlFor="drivingLicense">Permis de conduire</Label>
      </div>
      
      <div className="space-y-2 pt-2">
        <Label htmlFor="documentNumber">Numéro de pièce d'identité</Label>
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <Input
            id="documentNumber"
            placeholder="Entrez le numéro de la pièce d'identité"
            value={formData.documents.documentNumber}
            onChange={(e) => handleDocumentNumberChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  </div>
);
