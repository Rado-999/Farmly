INSERT INTO public.profiles (
  id,
  name,
  email,
  role,
  is_profile_complete,
  onboarding_step
)
SELECT
  u.id,
  NULLIF(TRIM(COALESCE(u.raw_user_meta_data->>'full_name', '')), ''),
  u.email,
  'buyer',
  false,
  1
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;;
