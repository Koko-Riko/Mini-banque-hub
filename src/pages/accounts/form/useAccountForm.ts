import { useState, useEffect } from "react";
import { useBanking } from "@/contexts/BankingContext";
import { Account } from "@/types/banking";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";

const accountFormSchema = z.object({
  firstName: z.string()
    .trim()
    .min(1, "Le prénom est requis")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le prénom ne peut contenir que des lettres"),
  lastName: z.string()
    .trim()
    .min(1, "Le nom est requis")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom ne peut contenir que des lettres"),
  email: z.string()
    .trim()
    .email("Email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères")
    .optional()
    .or(z.literal("")),
  phone: z.string()
    .trim()
    .min(8, "Le numéro de téléphone doit contenir au moins 8 chiffres")
    .max(20, "Le numéro de téléphone ne peut pas dépasser 20 caractères")
    .regex(/^[0-9+\s()-]+$/, "Format de téléphone invalide"),
  address: z.string()
    .trim()
    .min(5, "L'adresse doit contenir au moins 5 caractères")
    .max(200, "L'adresse ne peut pas dépasser 200 caractères"),
  birthDate: z.string()
    .min(1, "La date de naissance est requise")
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 120;
    }, "Le client doit avoir au moins 18 ans"),
  birthPlace: z.string()
    .trim()
    .min(2, "Le lieu de naissance est requis")
    .max(100, "Le lieu de naissance ne peut pas dépasser 100 caractères"),
  balance: z.number()
    .min(0, "Le solde initial ne peut pas être négatif")
    .max(10000000, "Le solde initial ne peut pas dépasser 10 000 000"),
  documents: z.object({
    documentNumber: z.string()
      .trim()
      .min(5, "Le numéro de document doit contenir au moins 5 caractères")
      .max(50, "Le numéro de document ne peut pas dépasser 50 caractères")
      .regex(/^[A-Z0-9-]+$/i, "Format de numéro de document invalide"),
  }).passthrough(),
  notes: z.string()
    .max(1000, "Les notes ne peuvent pas dépasser 1000 caractères")
    .optional(),
  accountNumber: z.string().optional(),
  accountType: z.string(),
  currency: z.string(),
  gender: z.string(),
  activity: z.string(),
  device: z.string(),
  photo: z.string().optional(),
  termsAccepted: z.boolean(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
});

export interface AccountFormData {
  firstName: string;
  lastName: string;
  accountNumber: string;
  balance: number;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  accountType: string;
  currency: string;
  notes: string;
  gender: string;
  birthDate: string;
  birthPlace: string;
  activity: string;
  device: string;
  photo: string;
  termsAccepted: boolean;
  documents: {
    passport: boolean;
    idCard: boolean;
    drivingLicense: boolean;
    documentNumber: string;
  }
}

const getDefaultFormData = (): AccountFormData => ({
  firstName: "",
  lastName: "",
  accountNumber: "Généré automatiquement",
  balance: 500,
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  accountType: "courant",
  currency: "HTG",
  notes: "",
  gender: "homme",
  birthDate: "",
  birthPlace: "",
  activity: "salarie",
  device: "HTG",
  photo: "",
  termsAccepted: false,
  documents: {
    passport: false,
    idCard: false,
    drivingLicense: false,
    documentNumber: ""
  }
});

// Map DB gender values to form values
const mapGenderFromDB = (gender?: string): string => {
  switch (gender) {
    case "male": return "homme";
    case "female": return "femme";
    case "other": return "autre";
    default: return "homme";
  }
};

// Map DB activity values to form values
const mapActivityFromDB = (activity?: string): string => {
  switch (activity) {
    case "salary": return "salarie";
    case "student": return "etudiant";
    case "scholar": return "eleve";
    case "self_employed": return "independant";
    default: return "salarie";
  }
};

// Map DB document type to form checkboxes
const mapDocumentTypeFromDB = (docType?: string) => {
  return {
    passport: docType === "passport",
    idCard: docType === "id_card",
    drivingLicense: docType === "driver_license",
  };
};

// Map DB account type to form values
const mapAccountTypeFromDB = (type?: string): string => {
  switch (type) {
    case "Compte Epargne": return "epargne";
    case "Compte Courant": return "courant";
    case "Compte d'investissement": return "investissement";
    default: return "courant";
  }
};

export const useAccountForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { createAccount, updateAccount, getAccountById, accounts } = useBanking();
  
  const isEditMode = !!id;
  const existingAccount = isEditMode ? getAccountById(id) : null;
  
  const [formData, setFormData] = useState<AccountFormData>(getDefaultFormData());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load existing account data for edit mode
  useEffect(() => {
    if (isEditMode && existingAccount && !isLoaded) {
      const docCheckboxes = mapDocumentTypeFromDB(existingAccount.documentType);
      setFormData({
        firstName: existingAccount.firstName || "",
        lastName: existingAccount.lastName || "",
        accountNumber: existingAccount.accountNumber || "",
        balance: existingAccount.balance || 0,
        email: existingAccount.email || "",
        phone: existingAccount.phone || "",
        address: existingAccount.address || "",
        city: existingAccount.city || "",
        postalCode: existingAccount.postalCode || "",
        accountType: mapAccountTypeFromDB(existingAccount.accountType),
        currency: existingAccount.currency || "HTG",
        notes: existingAccount.notes || "",
        gender: mapGenderFromDB(existingAccount.gender),
        birthDate: existingAccount.birthDate || "",
        birthPlace: existingAccount.birthPlace || "",
        activity: mapActivityFromDB(existingAccount.activity),
        device: existingAccount.currency || "HTG",
        photo: existingAccount.photoUrl || existingAccount.photo || "",
        termsAccepted: true, // Already accepted when creating
        documents: {
          ...docCheckboxes,
          documentNumber: existingAccount.documentNumber || "",
        }
      });
      setIsLoaded(true);
    }
  }, [isEditMode, existingAccount, isLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === "number" ? parseFloat(value) : value,
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      termsAccepted: checked,
    });
  };

  const handleDocumentCheckboxChange = (document: string, checked: boolean) => {
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        [document]: checked
      }
    });
  };

  const handleDocumentNumberChange = (value: string) => {
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        documentNumber: value
      }
    });
  };

  const handleRadioChange = (value: string) => {
    setFormData({
      ...formData,
      gender: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const setPhoto = (photoUrl: string) => {
    setFormData({
      ...formData,
      photo: photoUrl,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      accountFormSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast.error(`Validation error: ${firstError.message}`);
        return;
      }
      toast.error("Une erreur de validation s'est produite");
      return;
    }
    
    const clientName = `${formData.firstName} ${formData.lastName}`.trim();

    try {
      if (isEditMode && id) {
        const updates: Partial<Account> = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          clientName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          birthDate: formData.birthDate,
          birthPlace: formData.birthPlace,
          gender: formData.gender,
          activity: formData.activity,
          notes: formData.notes,
          documentNumber: formData.documents.documentNumber,
          photo: formData.photo,
        };
        await updateAccount(id, updates);
        navigate(`/accounts/${id}`);
      } else {
        const accountData = { ...formData, clientName };
        await createAccount(accountData as Omit<Account, "id" | "creationDate" | "lastActivity">);
        navigate("/accounts");
      }
    } catch (error) {
      // Error already handled in context
    }
  };
  
  const handleCancel = () => {
    if (isEditMode && id) {
      navigate(`/accounts/${id}`);
    } else {
      navigate("/accounts");
    }
  };

  return {
    formData,
    setFormData,
    handleChange,
    handleCheckboxChange,
    handleDocumentCheckboxChange,
    handleDocumentNumberChange,
    handleRadioChange,
    handleSelectChange,
    setPhoto,
    handleSubmit,
    handleCancel,
    isEditMode,
  };
};
