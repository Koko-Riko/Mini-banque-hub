
import React from "react";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";

interface PhotoUploaderProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({ 
  formData, 
  setFormData 
}) => (
  <div className="space-y-2">
    <Label htmlFor="photo">Photo d'identité</Label>
    <div 
      className="flex justify-center items-center h-24 border border-dashed rounded-md bg-muted/30 cursor-pointer hover:bg-muted/50"
      onClick={() => document.getElementById('photo')?.click()}
    >
      <div className="text-center">
        <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
        <span className="text-xs text-muted-foreground mt-2">Choisir un fichier</span>
      </div>
      <input 
        id="photo" 
        type="file" 
        className="hidden" 
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({...formData, photo: URL.createObjectURL(file)});
          }
        }}
      />
    </div>
  </div>
);
