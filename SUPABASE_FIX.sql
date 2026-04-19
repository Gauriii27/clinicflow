-- ============================================
-- DROP ALL EXISTING POLICIES (Force drop)
-- ============================================

DROP POLICY IF EXISTS "Allow anyone to sign up" ON public.users CASCADE;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users CASCADE;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users CASCADE;
DROP POLICY IF EXISTS "Enable insert for signup" ON public.users CASCADE;
DROP POLICY IF EXISTS "Enable read access for users" ON public.users CASCADE;
DROP POLICY IF EXISTS "Enable update for own profile" ON public.users CASCADE;

-- ============================================
-- CREATE CORRECT POLICIES FOR SIGNUP
-- ============================================

-- Allow unauthenticated users to INSERT during signup
CREATE POLICY "Enable insert for signup"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- Allow users to read own profile
CREATE POLICY "Enable read access for users"
  ON public.users FOR SELECT
  USING (true);

-- Allow users to update own profile
CREATE POLICY "Enable update for own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
