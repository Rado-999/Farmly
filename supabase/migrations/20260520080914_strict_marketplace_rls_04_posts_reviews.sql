
-- posts
CREATE POLICY "posts_select_public"
  ON public.posts
  FOR SELECT
  USING (true);

CREATE POLICY "posts_insert_farmer"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      INNER JOIN public.profiles p ON p.id = fp.profile_id
      WHERE fp.id = farmer_id
        AND fp.profile_id = auth.uid()
        AND p.role = 'farmer'
    )
  );

CREATE POLICY "posts_update_farmer"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      INNER JOIN public.profiles p ON p.id = fp.profile_id
      WHERE fp.id = farmer_id
        AND fp.profile_id = auth.uid()
        AND p.role = 'farmer'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      INNER JOIN public.profiles p ON p.id = fp.profile_id
      WHERE fp.id = farmer_id
        AND fp.profile_id = auth.uid()
        AND p.role = 'farmer'
    )
  );

CREATE POLICY "posts_delete_farmer"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      INNER JOIN public.profiles p ON p.id = fp.profile_id
      WHERE fp.id = farmer_id
        AND fp.profile_id = auth.uid()
        AND p.role = 'farmer'
    )
  );

-- reviews
CREATE POLICY "reviews_select_public"
  ON public.reviews
  FOR SELECT
  USING (true);

CREATE POLICY "reviews_insert_authenticated"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_delete_own"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
;
