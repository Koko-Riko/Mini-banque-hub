-- Drop the permissive RLS policy that allows all authenticated users to view reports
DROP POLICY IF EXISTS "Authenticated users can view all reports" ON public.reports;

-- Create a restrictive policy that only allows admins to view reports
CREATE POLICY "Only admins can view reports"
ON public.reports FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));