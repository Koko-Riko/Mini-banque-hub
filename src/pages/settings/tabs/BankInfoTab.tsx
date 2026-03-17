import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Upload, Landmark } from "lucide-react";

interface BankInfo {
  id: string;
  name: string;
  logo_url: string | null;
  currency: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  slogan: string | null;
}

export const BankInfoTab = () => {
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBankInfo();
  }, []);

  const fetchBankInfo = async () => {
    try {
      const { data, error } = await supabase
        .from("bank_info")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setBankInfo(data);
    } catch (error) {
      console.error("Error fetching bank info:", error);
      toast.error("Erreur lors du chargement des informations");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!bankInfo) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("bank_info")
        .update({
          name: bankInfo.name,
          logo_url: bankInfo.logo_url,
          currency: bankInfo.currency,
          address: bankInfo.address,
          phone: bankInfo.phone,
          email: bankInfo.email,
          website: bankInfo.website,
          slogan: bankInfo.slogan,
        })
        .eq("id", bankInfo.id);

      if (error) throw error;
      toast.success("Informations mises à jour avec succès");
    } catch (error) {
      console.error("Error saving bank info:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof BankInfo, value: string) => {
    if (bankInfo) {
      setBankInfo({ ...bankInfo, [field]: value });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Landmark className="h-5 w-5" />
          Informations de la Banque
        </CardTitle>
        <CardDescription>
          Ces informations seront affichées sur tous les reçus et documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la banque</Label>
            <Input
              id="name"
              value={bankInfo?.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Nom de la banque"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Devise</Label>
            <Input
              id="currency"
              value={bankInfo?.currency || ""}
              onChange={(e) => updateField("currency", e.target.value)}
              placeholder="GHT"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="slogan">Slogan</Label>
          <Input
            id="slogan"
            value={bankInfo?.slogan || ""}
            onChange={(e) => updateField("slogan", e.target.value)}
            placeholder="Votre partenaire financier de confiance"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo_url">URL du logo</Label>
          <Input
            id="logo_url"
            value={bankInfo?.logo_url || ""}
            onChange={(e) => updateField("logo_url", e.target.value)}
            placeholder="https://example.com/logo.png"
          />
          {bankInfo?.logo_url && (
            <div className="mt-2 p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Aperçu:</p>
              <img
                src={bankInfo.logo_url}
                alt="Logo de la banque"
                className="max-h-20 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Textarea
            id="address"
            value={bankInfo?.address || ""}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="Adresse complète de la banque"
            rows={2}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={bankInfo?.phone || ""}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+509 XXXX XXXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={bankInfo?.email || ""}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="contact@banque.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Site web</Label>
          <Input
            id="website"
            value={bankInfo?.website || ""}
            onChange={(e) => updateField("website", e.target.value)}
            placeholder="https://www.banque.com"
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </CardContent>
    </Card>
  );
};
