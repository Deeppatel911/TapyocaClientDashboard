-- Fix profiles table RLS policy for user signup
-- Add missing INSERT policy for profiles table
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Also ensure profiles table user_id equivalent (id) is not nullable
-- The id column should reference auth.users and be required
ALTER TABLE public.profiles 
ALTER COLUMN id SET NOT NULL;