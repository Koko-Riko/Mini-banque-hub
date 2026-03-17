-- Create a function to check if user is a general admin (admin without branch)
CREATE OR REPLACE FUNCTION public.is_general_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
      AND branch_id IS NULL
  )
$$;

-- Create a function to get user's branch_id
CREATE OR REPLACE FUNCTION public.get_user_branch_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT branch_id
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Drop existing policies on accounts
DROP POLICY IF EXISTS "Users can view their own accounts or admins can view all" ON public.accounts;
DROP POLICY IF EXISTS "Users can update their own accounts or admins can update all" ON public.accounts;
DROP POLICY IF EXISTS "Only admins can delete accounts" ON public.accounts;
DROP POLICY IF EXISTS "Authenticated users can create accounts" ON public.accounts;

-- Create new policies for accounts with branch-based access
CREATE POLICY "View accounts based on role and branch"
ON public.accounts FOR SELECT
USING (
  -- General admin can see all
  is_general_admin(auth.uid())
  OR
  -- Branch admin/director can see accounts from their branch
  (has_role(auth.uid(), 'admin') AND branch_id = get_user_branch_id(auth.uid()))
  OR
  -- Cashiers can see accounts they created in their branch
  (created_by = auth.uid())
);

CREATE POLICY "Update accounts based on role and branch"
ON public.accounts FOR UPDATE
USING (
  is_general_admin(auth.uid())
  OR
  (has_role(auth.uid(), 'admin') AND branch_id = get_user_branch_id(auth.uid()))
  OR
  (created_by = auth.uid())
)
WITH CHECK (
  is_general_admin(auth.uid())
  OR
  (has_role(auth.uid(), 'admin') AND branch_id = get_user_branch_id(auth.uid()))
  OR
  (created_by = auth.uid())
);

CREATE POLICY "Delete accounts - general admin only"
ON public.accounts FOR DELETE
USING (is_general_admin(auth.uid()));

CREATE POLICY "Create accounts - authenticated users"
ON public.accounts FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Drop existing policies on transactions
DROP POLICY IF EXISTS "Users can view txns for their accounts or admins view all" ON public.transactions;
DROP POLICY IF EXISTS "Users can create txns for their accounts or admins create any" ON public.transactions;

-- Create new policies for transactions with branch-based access
CREATE POLICY "View transactions based on role and branch"
ON public.transactions FOR SELECT
USING (
  is_general_admin(auth.uid())
  OR
  (has_role(auth.uid(), 'admin') AND branch_id = get_user_branch_id(auth.uid()))
  OR
  (performed_by = auth.uid())
);

CREATE POLICY "Create transactions based on role and branch"
ON public.transactions FOR INSERT
WITH CHECK (
  is_general_admin(auth.uid())
  OR
  (has_role(auth.uid(), 'admin') AND get_user_branch_id(auth.uid()) IS NOT NULL)
  OR
  (auth.uid() IS NOT NULL)
);

-- Drop existing policies on loans
DROP POLICY IF EXISTS "Users can view loans for their accounts or admins view all" ON public.loans;
DROP POLICY IF EXISTS "Users can update loans for their accounts or admins update all" ON public.loans;
DROP POLICY IF EXISTS "Users can create loans for their accounts or admins create any" ON public.loans;

-- Create new policies for loans with branch-based access
CREATE POLICY "View loans based on role and branch"
ON public.loans FOR SELECT
USING (
  is_general_admin(auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM accounts 
    WHERE accounts.id = loans.account_id 
    AND (
      (has_role(auth.uid(), 'admin') AND accounts.branch_id = get_user_branch_id(auth.uid()))
      OR accounts.created_by = auth.uid()
    )
  )
);

CREATE POLICY "Update loans based on role and branch"
ON public.loans FOR UPDATE
USING (
  is_general_admin(auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM accounts 
    WHERE accounts.id = loans.account_id 
    AND has_role(auth.uid(), 'admin') 
    AND accounts.branch_id = get_user_branch_id(auth.uid())
  )
)
WITH CHECK (
  is_general_admin(auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM accounts 
    WHERE accounts.id = loans.account_id 
    AND has_role(auth.uid(), 'admin') 
    AND accounts.branch_id = get_user_branch_id(auth.uid())
  )
);

CREATE POLICY "Create loans based on role and branch"
ON public.loans FOR INSERT
WITH CHECK (
  is_general_admin(auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM accounts 
    WHERE accounts.id = loans.account_id 
    AND has_role(auth.uid(), 'admin')
  )
);

-- Update loan_payments policies
DROP POLICY IF EXISTS "Users can view loan pmts for their accounts or admins view all" ON public.loan_payments;
DROP POLICY IF EXISTS "Users can create loan pmts for their accounts or admins create" ON public.loan_payments;

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
      (has_role(auth.uid(), 'admin') AND accounts.branch_id = get_user_branch_id(auth.uid()))
      OR accounts.created_by = auth.uid()
    )
  )
);

CREATE POLICY "Create loan payments based on role and branch"
ON public.loan_payments FOR INSERT
WITH CHECK (
  is_general_admin(auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM loans
    JOIN accounts ON accounts.id = loans.account_id
    WHERE loans.id = loan_payments.loan_id
    AND (has_role(auth.uid(), 'admin') OR accounts.created_by = auth.uid())
  )
);

-- Update profiles policy to allow admins to view all profiles for user management
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "View profiles based on role"
ON public.profiles FOR SELECT
USING (
  auth.uid() = user_id
  OR is_general_admin(auth.uid())
);

-- Update user_roles to allow general admin to view all
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "View user roles based on access"
ON public.user_roles FOR SELECT
USING (
  auth.uid() = user_id
  OR is_general_admin(auth.uid())
);