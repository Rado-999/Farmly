-- ---------------------------------------------------------------------------
-- J. RLS policies (STRICT)
-- ---------------------------------------------------------------------------

-- profiles: no public reads; own row only
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND role = ANY (ARRAY['buyer'::text, 'farmer'::text])
  );

CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- farmer_profiles: public read; owner writes
CREATE POLICY "farmer_profiles_select_public"
  ON public.farmer_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "farmer_profiles_insert_own"
  ON public.farmer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = profile_id
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'farmer'::text
    )
  );

CREATE POLICY "farmer_profiles_update_own"
  ON public.farmer_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "farmer_profiles_delete_own"
  ON public.farmer_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = profile_id);
;
