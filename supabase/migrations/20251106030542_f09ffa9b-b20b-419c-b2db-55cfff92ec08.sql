-- Fix PUBLIC_DATA_EXPOSURE: Restrict accounts table access to account creators or admins
DROP POLICY IF EXISTS "Authenticated users can view all accounts" ON public.accounts;

CREATE POLICY "Users can view their own accounts or admins can view all"
ON public.accounts
FOR SELECT
TO authenticated
USING (
  auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role)
);

-- Fix CLIENT_SIDE_AUTH: Restrict loan creation and modification to admins only
DROP POLICY IF EXISTS "Authenticated users can create loans" ON public.loans;
DROP POLICY IF EXISTS "Authenticated users can update loans" ON public.loans;

CREATE POLICY "Only admins can create loans"
ON public.loans
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update loans"
ON public.loans
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix transaction access: Restrict to account owners or admins
DROP POLICY IF EXISTS "Authenticated users can view all transactions" ON public.transactions;

CREATE POLICY "Users can view transactions for their accounts or admins can view all"
ON public.transactions
FOR SELECT
TO authenticated
USING (
  account_id IN (
    SELECT id FROM public.accounts WHERE created_by = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role)
);

-- Restrict transaction creation to account owners or admins
DROP POLICY IF EXISTS "Authenticated users can create transactions" ON public.transactions;

CREATE POLICY "Users can create transactions for their accounts or admins can create any"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (
  account_id IN (
    SELECT id FROM public.accounts WHERE created_by = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role)
);