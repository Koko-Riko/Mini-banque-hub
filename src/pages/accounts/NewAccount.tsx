
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AccountForm from "./AccountForm";
import { useAccountForm } from "./form/useAccountForm";
import { useNavigate, useParams } from "react-router-dom";

const NewAccount = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const accountForm = useAccountForm();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={accountForm.handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">
          {accountForm.isEditMode ? "Modifier le compte" : "Créer un nouveau compte"}
        </h1>
      </div>

      <AccountForm 
        formData={accountForm.formData}
        handleChange={accountForm.handleChange}
        handleCheckboxChange={accountForm.handleCheckboxChange}
        handleDocumentCheckboxChange={accountForm.handleDocumentCheckboxChange}
        handleDocumentNumberChange={accountForm.handleDocumentNumberChange}
        handleRadioChange={accountForm.handleRadioChange}
        handleSelectChange={accountForm.handleSelectChange}
        handleSubmit={accountForm.handleSubmit}
        handleCancel={accountForm.handleCancel}
        setFormData={accountForm.setFormData}
        isEditMode={accountForm.isEditMode}
      />
    </div>
  );
};

export default NewAccount;
