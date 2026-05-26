ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- I. Drop old RLS policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read farmer profiles" ON public.farmer_profiles;
DROP POLICY IF EXISTS "Users can create own farmer profile" ON public.farmer_profiles;
DROP POLICY IF EXISTS "Users can update own farmer profile" ON public.farmer_profiles;
DROP POLICY IF EXISTS "farmer_profiles_select_public" ON public.farmer_profiles;
DROP POLICY IF EXISTS "farmer_profiles_insert_own" ON public.farmer_profiles;
DROP POLICY IF EXISTS "farmer_profiles_update_own" ON public.farmer_profiles;
DROP POLICY IF EXISTS "farmer_profiles_delete_own" ON public.farmer_profiles;

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "products_select_public" ON public.products;
DROP POLICY IF EXISTS "products_insert_farmer" ON public.products;
DROP POLICY IF EXISTS "products_update_farmer" ON public.products;
DROP POLICY IF EXISTS "products_delete_farmer" ON public.products;

DROP POLICY IF EXISTS "Public read videos" ON public.videos;
DROP POLICY IF EXISTS "videos_select_public" ON public.videos;
DROP POLICY IF EXISTS "videos_insert_farmer" ON public.videos;
DROP POLICY IF EXISTS "videos_update_farmer" ON public.videos;
DROP POLICY IF EXISTS "videos_delete_farmer" ON public.videos;

DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_authenticated" ON public.reviews;
DROP POLICY IF EXISTS "reviews_update_own" ON public.reviews;
DROP POLICY IF EXISTS "reviews_delete_own" ON public.reviews;

DROP POLICY IF EXISTS "follows_select_self_or_owned_farmer" ON public.follows;
DROP POLICY IF EXISTS "follows_insert_authenticated" ON public.follows;
DROP POLICY IF EXISTS "follows_delete_own" ON public.follows;

DROP POLICY IF EXISTS "posts_select_public" ON public.posts;
DROP POLICY IF EXISTS "posts_insert_farmer" ON public.posts;
DROP POLICY IF EXISTS "posts_update_farmer" ON public.posts;
DROP POLICY IF EXISTS "posts_delete_farmer" ON public.posts;
;
