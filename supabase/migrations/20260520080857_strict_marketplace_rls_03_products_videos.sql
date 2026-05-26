
-- products
CREATE POLICY "products_select_public"
  ON public.products
  FOR SELECT
  USING (true);

CREATE POLICY "products_insert_farmer"
  ON public.products
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

CREATE POLICY "products_update_farmer"
  ON public.products
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

CREATE POLICY "products_delete_farmer"
  ON public.products
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

-- videos
CREATE POLICY "videos_select_public"
  ON public.videos
  FOR SELECT
  USING (true);

CREATE POLICY "videos_insert_farmer"
  ON public.videos
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

CREATE POLICY "videos_update_farmer"
  ON public.videos
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

CREATE POLICY "videos_delete_farmer"
  ON public.videos
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
;
