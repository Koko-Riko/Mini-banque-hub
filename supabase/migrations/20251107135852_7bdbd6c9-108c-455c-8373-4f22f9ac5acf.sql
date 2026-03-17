-- Fix critical RLS policy issues - restrict data access based on ownership and role

-- ============================================
-- ACCOUNTS TABLE - Fix unrestricted access
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view accounts" ON public.accounts;
DROP POLICY IF EXISTS "Authenticated users can update accounts" ON public.accounts;

-- Users can only view accounts they created OR admins can view all
CREATE POLICY "Users can view their own accounts or admins can view all"
ON public.accounts
FOR SELECT
TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Users can only update accounts they created OR admins can update all
CREATE POLICY "Users can update their own accounts or admins can update all"
ON public.accounts
FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- TRANSACTIONS TABLE - Fix unrestricted access
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can create transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create transactions for their accounts or admins can " ON public.transactions;

-- Users can only view transactions for accounts they created OR admins can view all
CREATE POLICY "Users can view txns for their accounts or admins view all"
ON public.transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.accounts
    WHERE accounts.id = transactions.account_id
    AND (accounts.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Users can only create transactions for accounts they created OR admins can create for any account
CREATE POLICY "Users can create txns for their accounts or admins create any"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.accounts
    WHERE accounts.id = transactions.account_id
    AND (accounts.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- ============================================
-- LOANS TABLE - Fix public exposure
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view all loans" ON public.loans;
DROP POLICY IF EXISTS "Authenticated users can update loans" ON public.loans;

-- Users can only view loans for accounts they created OR admins can view all
CREATE POLICY "Users can view loans for their accounts or admins view all"
ON public.loans
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.accounts
    WHERE accounts.id = loans.account_id
    AND (accounts.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Users can only update loans for accounts they created OR admins can update all
CREATE POLICY "Users can update loans for their accounts or admins update all"
ON public.loans
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.accounts
    WHERE accounts.id = loans.account_id
    AND (accounts.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.accounts
    WHERE accounts.id = loans.account_id
    AND (accounts.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- ============================================
-- LOAN_PAYMENTS TABLE - Fix public exposure
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view all loan payments" ON public.loan_payments;
DROP POLICY IF EXISTS "Authenticated users can create loan payments" ON public.loan_payments;

-- Users can only view loan payments for their accounts OR admins can view all
CREATE POLICY "Users can view loan pmts for their accounts or admins view all"
ON public.loan_payments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.loans
    JOIN public.accounts ON accounts.id = loans.account_id
    WHERE loans.id = loan_payments.loan_id
    AND (accounts.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Users can only create loan payments for their accounts OR admins can create for any account
CREATE POLICY "Users can create loan pmts for their accounts or admins create any"
ON public.loan_payments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.loans
    JOIN public.accounts ON accounts.id = loans.account_id
    WHERE loans.id = loan_payments.loan_id
    AND (accounts.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);