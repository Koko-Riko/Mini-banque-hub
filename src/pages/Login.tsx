
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, AlertCircle, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { z } from "zod";
import bankLogo from "@/assets/bank-logo.svg";

const loginSchema = z.object({
  email: z.string().trim().email("Format d'email invalide").max(255, "Email trop long"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").max(128, "Mot de passe trop long"),
});

const signupSchema = loginSchema.extend({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100, "Nom trop long"),
});

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const { login, signup, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger vers la page d'accueil si l'utilisateur est déjà connecté
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      if (isSignupMode) {
        const validatedData = signupSchema.parse({ email, password, name });
        const success = await signup(validatedData.email, validatedData.password, validatedData.name);
        
        if (success) {
          navigate("/");
        } else {
          setError("Erreur lors de l'inscription. Veuillez réessayer.");
        }
      } else {
        const validatedData = loginSchema.parse({ email, password });
        const success = await login(validatedData.email, validatedData.password);
        
        if (success) {
          navigate("/");
        } else {
          setError("Identifiants incorrects. Veuillez réessayer.");
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <img src={bankLogo} alt="Bank of la Gonâve" className="w-20 h-20 mb-2" />
          <CardTitle className="text-2xl font-bold text-center">Bank of la Gonâve</CardTitle>
          <CardDescription className="text-center">
            {isSignupMode ? "Créez votre compte" : "Connectez-vous pour accéder à votre espace"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showHelp && (
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-sm">
                <p className="font-medium mb-1">Besoin d'aide ?</p>
                {isSignupMode ? (
                  <p>Créez votre compte pour accéder à l'application. Un administrateur devra vous attribuer un rôle.</p>
                ) : (
                  <p>Si vous n'avez pas encore de compte, cliquez sur "Créer un compte" ci-dessous.</p>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {isSignupMode && (
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Votre nom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-banking-primary hover:bg-banking-primary/90"
              disabled={isLoading}
            >
              {isLoading 
                ? (isSignupMode ? "Création du compte..." : "Connexion en cours...")
                : (isSignupMode ? "Créer mon compte" : "Se connecter")
              }
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsSignupMode(!isSignupMode);
                setError("");
              }}
            >
              {isSignupMode ? "Déjà un compte ? Se connecter" : "Créer un compte"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <Button 
            variant="ghost" 
            className="text-sm text-gray-500"
            onClick={() => setShowHelp(!showHelp)}
          >
            {showHelp ? "Masquer l'aide" : "Besoin d'aide pour vous connecter ?"}
          </Button>
          <div className="text-sm text-center w-full text-gray-500 mt-2">
            <div className="flex items-center justify-center gap-1">
              <Lock className="w-4 h-4" />
              <span>Espace sécurisé</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
