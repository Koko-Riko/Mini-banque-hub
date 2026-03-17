-- Désactiver temporairement les triggers d'audit pour permettre la suppression
DROP TRIGGER IF EXISTS audit_user_roles_changes ON user_roles;
DROP TRIGGER IF EXISTS audit_accounts_changes ON accounts;
DROP TRIGGER IF EXISTS audit_transactions_changes ON transactions;
DROP TRIGGER IF EXISTS audit_loans_changes ON loans;
DROP TRIGGER IF EXISTS audit_loan_payments_changes ON loan_payments;

-- Supprimer toutes les données existantes
DELETE FROM audit_logs;
DELETE FROM user_roles;
DELETE FROM profiles;

-- Mettre à jour la fonction handle_new_user pour reconnaître le nouvel email admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Créer le profil avec email
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  
  -- Déterminer le rôle basé sur l'email
  IF new.email IN ('waldo.joseph@jaunemultiservices.com', 'admin@jaunemultiservices.com', 'waldojoseph163@gmail.com') THEN
    user_role := 'admin';
  ELSE
    user_role := 'cashier';
  END IF;
  
  -- Assigner le rôle
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, user_role);
  
  RETURN new;
END;
$$;

-- Réactiver les triggers d'audit
CREATE TRIGGER audit_accounts_changes
  AFTER INSERT OR UPDATE OR DELETE ON accounts
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_transactions_changes
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_loans_changes
  AFTER INSERT OR UPDATE OR DELETE ON loans
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_loan_payments_changes
  AFTER INSERT OR UPDATE OR DELETE ON loan_payments
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_user_roles_changes
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();