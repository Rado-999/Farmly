
-- follows
CREATE POLICY "follows_select_self_or_owned_farmer"
  ON public.follows
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      WHERE fp.id = follows.farmer_id
        AND fp.profile_id = auth.uid()
    )
  );

CREATE POLICY "follows_insert_authenticated"
  ON public.follows
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND NOT EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      WHERE fp.id = farmer_id
        AND fp.profile_id = user_id
    )
  );

CREATE POLICY "follows_delete_own"
  ON public.follows
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- K. Backfill auth users missing profiles (production safety)
-- ---------------------------------------------------------------------------
INSERT INTO public.profiles (id, email, name, role, is_profile_complete, onboarding_step)
SELECT
  u.id,
  u.email,
  NULLIF(TRIM(u.raw_user_meta_data ->> 'full_name'), ''),
  'buyer',
  false,
  1
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;
;
