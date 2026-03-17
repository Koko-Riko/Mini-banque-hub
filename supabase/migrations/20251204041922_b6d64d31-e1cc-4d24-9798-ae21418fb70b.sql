-- Drop existing policies
DROP POLICY IF EXISTS "View accounts based on role and branch" ON public.accounts;
DROP POLICY IF EXISTS "Update accounts based on role and branch" ON public.accounts;
DROP POLICY IF EXISTS "View transactions based on role and branch" ON public.transactions;
DROP POLICY IF EXISTS "View loans based on role and branch" ON public.loans;
DROP POLICY IF EXISTS "View loan payments based on role and branch" ON public.loan_payments;

-- Create new policy for accounts - cashiers see all from their branch
CREATE POLICY "View accounts based on role and branch"
ON public.accounts FOR SELECT
USING (
  -- General admin can see all
  is_general_admin(auth.uid())
  OR
  -- Branch admin/director can see accounts from their branch
  (has_role(auth.uid(), 'admin') AND branch_id = get_user_branch_id(auth.uid()))
  OR
  -- Cashiers can see all accounts from their branch
  (branch_id = get_user_branch_id(auth.uid()))
  OR
  -- Fallback: users can see accounts they created
  (created_by = auth.uid())
);

CREATE POLICY "Update accounts based on role and branch"
ON public.accounts FOR UPDATE
USING (
  is_general_admin(auth.uid())
  OR
  (has_role(auth.uid(), 'admin') AND branch_id = get_user_branch_id(auth.uid()))
  OR
  -- Cashiers can update accounts from their branch
  (branch_id = get_user_branch_id(auth.uid()))
  OR
  (created_by = auth.uid())
)
WITH CHECK (
  is_general_admin(auth.uid())
  OR
  (has_role(auth.uid(), 'admin') AND branch_id = get_user_branch_id(auth.uid()))
  OR
  (branch_id = get_user_branch_id(auth.uid()))
  OR
  (created_by = auth.uid())
);

-- Create new policy for transactions - cashiers see all from their branch
CREATE POLICY "View transactions based on role and branch"
ON public.transactions FOR SELECT
USING (
  is_general_admin(auth.uid())
  OR
  -- Branch admin/director can see transactions from their branch
  (has_role(auth.uid(), 'admin') AND branch_id = get_user_branch_id(auth.uid()))
  OR
  -- Cashiers can see all transactions from their branch
  (branch_id = get_user_branch_id(auth.uid()))
  OR
  -- Fallback: users can see transactions they performed
  (performed_by = auth.uid())
);

-- Create new policy for loans - cashiers see all from their branch
CREATE POLICY "View loans based on role and branch"
ON public.loans FOR SELECT
USING (
  is_general_admin(auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM accounts 
    WHERE accounts.id = loans.account_id 
    AND (
      -- Branch admin sees loans for accounts in their branch
      (has_role(auth.uid(), 'admin') AND accounts.branch_id = get_user_branch_id(auth.uid()))
      OR
      -- Cashiers see loans for accounts in their branch
      (accounts.branch_id = get_user_branch_id(auth.uid()))
      OR
      -- Fallback: see loans for accounts they created
      accounts.created_by = auth.uid()
    )
  )
);

-- Create new policy for loan payments - cashiers see all from their branch
CREATE POLICY "View loan payments based on role and branch"
ON public.loan_payments FOR SELECT
USING (
  is_general_admin(auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM loans
    JOIN accounts ON accounts.id = loans.account_id
    WHERE loans.id = loan_payments.loan_id
    AND (
      -- Branch admin sees payments for loans in their branch
      (has_role(auth.uid(), 'admin') AND accounts.branch_id = get_user_branch_id(auth.uid()))
      OR
      -- Cashiers see payments for loans in their branch
      (accounts.branch_id = get_user_branch_id(auth.uid()))
      OR
      -- Fallback: see payments for accounts they created
      accounts.created_by = auth.uid()
    )
  )
);