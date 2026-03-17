-- Fix 1: Make accounts.created_by NOT NULL
-- First, update any existing NULL values (if any exist)
UPDATE public.accounts 
SET created_by = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
WHERE created_by IS NULL;

-- Now make the column NOT NULL
ALTER TABLE public.accounts 
ALTER COLUMN created_by SET NOT NULL;

-- Optionally set a default for future inserts
ALTER TABLE public.accounts 
ALTER COLUMN created_by SET DEFAULT auth.uid();

-- Fix 2: Restrict loan creation to owned accounts only
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can create loans" ON public.loans;

-- Create a properly scoped policy
CREATE POLICY "Users can create loans for their accounts or admins create any"
ON public.loans
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.accounts
    WHERE accounts.id = loans.account_id
    AND (accounts.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);