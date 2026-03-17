-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Only admins can create accounts" ON public.accounts;
DROP POLICY IF EXISTS "Only admins can update accounts" ON public.accounts;
DROP POLICY IF EXISTS "Only admins can delete accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can view their own accounts or admins can view all" ON public.accounts;

-- Create new policies allowing both cashiers and admins
CREATE POLICY "Authenticated users can create accounts"
ON public.accounts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view accounts"
ON public.accounts
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update accounts"
ON public.accounts
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can delete accounts"
ON public.accounts
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update transactions policies
DROP POLICY IF EXISTS "Users can create transactions for their accounts or admins can" ON public.transactions;
DROP POLICY IF EXISTS "Users can view transactions for their accounts or admins can vi" ON public.transactions;

CREATE POLICY "Authenticated users can create transactions"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Update loans policies
DROP POLICY IF EXISTS "Only admins can create loans" ON public.loans;
DROP POLICY IF EXISTS "Only admins can update loans" ON public.loans;

CREATE POLICY "Authenticated users can create loans"
ON public.loans
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update loans"
ON public.loans
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);