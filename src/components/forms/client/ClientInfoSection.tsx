
import React from "react";
import {
  PersonalInfoFields,
  ContactInfoFields,
  GenderSelector,
  ActivitySelector,
  PhotoUploader
} from "./components";

export const ClientInfoSection = ({ 
  formData, 
  handleChange, 
  handleRadioChange,
  handleSelectChange,
  setFormData 
}: { 
  formData: any, 
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
  handleRadioChange: (value: string) => void,
  handleSelectChange: (name: string, value: string) => void,
  setFormData: React.Dispatch<React.SetStateAction<any>>
}) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Informations du client</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <PhotoUploader formData={formData} setFormData={setFormData} />
      
      <PersonalInfoFields formData={formData} handleChange={handleChange} />
      
      <GenderSelector gender={formData.gender} handleRadioChange={handleRadioChange} />
      
      <ActivitySelector activity={formData.activity} handleSelectChange={handleSelectChange} />
      
      <ContactInfoFields formData={formData} handleChange={handleChange} />
    </div>
  </div>
);
