
-- 1. Remove duplicate loan_payments INSERT policy (keep the better branch-aware one)
DROP POLICY IF EXISTS "Users can create loan pmts for their accounts or admins create" ON public.loan_payments;

-- 2. Add DELETE restriction on loan_payments - admin only
CREATE POLICY "Only admins can delete loan payments"
ON public.loan_payments
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Add UPDATE restriction on loan_payments - admin only
CREATE POLICY "Only admins can update loan payments"
ON public.loan_payments
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. Restrict transaction creation - must have performed_by = auth.uid()
DROP POLICY IF EXISTS "Create transactions based on role and branch" ON public.transactions;
CREATE POLICY "Create transactions - authenticated with self reference"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND performed_by = auth.uid()
);

-- 5. Restrict account creation - created_by must be self
DROP POLICY IF EXISTS "Create accounts - authenticated users" ON public.accounts;
CREATE POLICY "Create accounts - authenticated with self reference"
ON public.accounts
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND created_by = auth.uid()
);

-- 6. Add audit_logs INSERT policy via security definer (for trigger use)
CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 7. Restrict loans creation - created_by must be self
DROP POLICY IF EXISTS "Create loans based on role and branch" ON public.loans;
CREATE POLICY "Create loans - admin with self reference"
ON public.loans
FOR INSERT
TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND (
    is_general_admin(auth.uid()) 
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- 8. Add performance indexes on audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_action ON public.audit_logs(table_name, action);

-- 9. Add index on transactions for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_performed_by ON public.transactions(performed_by);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- 10. Add index on loans
CREATE INDEX IF NOT EXISTS idx_loans_account_id ON public.loans(account_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans(status);
