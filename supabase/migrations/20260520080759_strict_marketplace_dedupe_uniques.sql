DELETE FROM public.farmer_profiles WHERE profile_id IS NULL;

DELETE FROM public.follows a
USING public.follows b
WHERE a.user_id = b.user_id
  AND a.farmer_id = b.farmer_id
  AND a.ctid < b.ctid;

DELETE FROM public.farmer_profiles fp1
USING public.farmer_profiles fp2
WHERE fp1.profile_id = fp2.profile_id
  AND fp1.ctid < fp2.ctid;


CREATE UNIQUE INDEX IF NOT EXISTS reviews_one_per_user_product
  ON public.reviews (user_id, product_id);

CREATE UNIQUE INDEX IF NOT EXISTS farmer_profiles_one_per_profile
  ON public.farmer_profiles (profile_id);

CREATE UNIQUE INDEX IF NOT EXISTS follows_one_per_user_farmer
  ON public.follows (user_id, farmer_id);
;
