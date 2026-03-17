
-- Drop existing restrictive SELECT policies on accounts
DROP POLICY IF EXISTS "View accounts based on role and branch" ON public.accounts;

-- Create new open SELECT policy for accounts
CREATE POLICY "View accounts - all authenticated users"
ON public.accounts FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Drop existing restrictive SELECT policies on transactions
DROP POLICY IF EXISTS "View transactions based on role and branch" ON public.transactions;

-- Create new open SELECT policy for transactions
CREATE POLICY "View transactions - all authenticated users"
ON public.transactions FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Drop existing restrictive SELECT policies on loans
DROP POLICY IF EXISTS "View loans based on role and branch" ON public.loans;

-- Create new open SELECT policy for loans
CREATE POLICY "View loans - all authenticated users"
ON public.loans FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Drop existing restrictive SELECT policies on loan_payments
DROP POLICY IF EXISTS "View loan payments based on role and branch" ON public.loan_payments;

-- Create new open SELECT policy for loan_payments
CREATE POLICY "View loan payments - all authenticated users"
ON public.loan_payments FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);
