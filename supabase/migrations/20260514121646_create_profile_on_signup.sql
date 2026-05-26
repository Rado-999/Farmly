CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_role text := COALESCE(NEW.raw_user_meta_data->>'role', 'buyer');
BEGIN
  IF selected_role NOT IN ('buyer', 'farmer') THEN
    selected_role := 'buyer';
  END IF;

  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
    selected_role
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();;
