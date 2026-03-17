
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ClientTypeSection,
  ClientInfoSection,
  AddressSection,
  AccountInfoSection,
  NotesSection,
  DocumentsSection,
} from "@/components/forms/sections";

interface AccountFormProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleCheckboxChange: (checked: boolean) => void;
  handleDocumentCheckboxChange: (document: string, checked: boolean) => void;
  handleDocumentNumberChange: (value: string) => void;
  handleRadioChange: (value: string) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleCancel: () => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  isEditMode?: boolean;
}

const AccountForm: React.FC<AccountFormProps> = ({
  formData,
  handleChange,
  handleCheckboxChange,
  handleDocumentCheckboxChange,
  handleDocumentNumberChange,
  handleRadioChange,
  handleSelectChange,
  handleSubmit,
  handleCancel,
  setFormData,
  isEditMode = false,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingEvent, setPendingEvent] = useState<React.FormEvent | null>(null);

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      setPendingEvent(e);
      setShowConfirmDialog(true);
    } else {
      handleSubmit(e);
    }
  };

  const confirmSave = () => {
    setShowConfirmDialog(false);
    if (pendingEvent) {
      handleSubmit(pendingEvent);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>{isEditMode ? "Modifier le Compte Client" : "Nouveau Compte Client"}</CardTitle>
        </CardHeader>
        <form onSubmit={onFormSubmit}>
          <CardContent className="space-y-6 pt-6">
            <ClientTypeSection handleSelectChange={handleSelectChange} />
            <ClientInfoSection 
              formData={formData} 
              handleChange={handleChange} 
              handleRadioChange={handleRadioChange}
              handleSelectChange={handleSelectChange}
              setFormData={setFormData}
            />
            <DocumentsSection
              formData={formData}
              handleDocumentCheckboxChange={handleDocumentCheckboxChange}
              handleDocumentNumberChange={handleDocumentNumberChange}
            />
            <AddressSection formData={formData} handleChange={handleChange} />
            {!isEditMode && (
              <AccountInfoSection 
                formData={formData} 
                handleChange={handleChange} 
                handleSelectChange={handleSelectChange} 
              />
            )}
            <NotesSection formData={formData} handleChange={handleChange} />
            
            {!isEditMode && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="termsAccepted" 
                  checked={formData.termsAccepted} 
                  onCheckedChange={handleCheckboxChange}
                />
                <Label htmlFor="termsAccepted">
                  J'accepte les conditions générales d'utilisation
                </Label>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={!isEditMode && !formData.termsAccepted}
            >
              {isEditMode ? "Enregistrer les modifications" : "Créer le compte"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer les modifications</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir enregistrer les modifications apportées à ce compte client ? Cette action mettra à jour les informations du client.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AccountForm;
