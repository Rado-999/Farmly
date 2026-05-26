-- Village retention: saved farms, follow preferences, visit tracking, events, digest prep

CREATE TABLE IF NOT EXISTS public.saved_farms (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  farmer_id uuid NOT NULL REFERENCES public.farmer_profiles (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, farmer_id)
);

CREATE INDEX IF NOT EXISTS saved_farms_user_id_idx ON public.saved_farms (user_id);

ALTER TABLE public.saved_farms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_farms_select_own" ON public.saved_farms;
DROP POLICY IF EXISTS "saved_farms_insert_own" ON public.saved_farms;
DROP POLICY IF EXISTS "saved_farms_delete_own" ON public.saved_farms;

CREATE POLICY "saved_farms_select_own"
  ON public.saved_farms
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "saved_farms_insert_own"
  ON public.saved_farms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_farms_delete_own"
  ON public.saved_farms
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

ALTER TABLE public.follows
  ADD COLUMN IF NOT EXISTS notify_level text NOT NULL DEFAULT 'digest',
  ADD COLUMN IF NOT EXISTS followed_via text;

ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_notify_level_check;
ALTER TABLE public.follows
  ADD CONSTRAINT follows_notify_level_check
  CHECK (notify_level IN ('off', 'digest', 'harvest', 'all_gentle'));

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS village_last_visited_at timestamptz,
  ADD COLUMN IF NOT EXISTS notification_email_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notification_digest_day smallint NOT NULL DEFAULT 0;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_notification_digest_day_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_notification_digest_day_check
  CHECK (notification_digest_day >= 0 AND notification_digest_day <= 6);

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'field_note',
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS season text;

ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_kind_check;
ALTER TABLE public.posts
  ADD CONSTRAINT posts_kind_check
  CHECK (kind IN ('field_note', 'harvest', 'season', 'event'));

UPDATE public.posts
SET published_at = COALESCE(published_at, created_at)
WHERE published_at IS NULL;

CREATE TABLE IF NOT EXISTS public.local_events (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  farmer_id uuid REFERENCES public.farmer_profiles (id) ON DELETE CASCADE,
  region text NOT NULL,
  city text,
  title text NOT NULL,
  description text,
  kind text NOT NULL CHECK (kind IN ('market', 'open_farm', 'harvest_day', 'workshop')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  location_label text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS local_events_region_starts_at_idx
  ON public.local_events (region, starts_at);

ALTER TABLE public.local_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "local_events_select_public" ON public.local_events;
CREATE POLICY "local_events_select_public"
  ON public.local_events
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "local_events_insert_farmer" ON public.local_events;
CREATE POLICY "local_events_insert_farmer"
  ON public.local_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    farmer_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      WHERE fp.id = farmer_id
        AND fp.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "local_events_update_farmer" ON public.local_events;
CREATE POLICY "local_events_update_farmer"
  ON public.local_events
  FOR UPDATE
  TO authenticated
  USING (
    farmer_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      WHERE fp.id = farmer_id
        AND fp.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "local_events_delete_farmer" ON public.local_events;
CREATE POLICY "local_events_delete_farmer"
  ON public.local_events
  FOR DELETE
  TO authenticated
  USING (
    farmer_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.farmer_profiles fp
      WHERE fp.id = farmer_id
        AND fp.profile_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  kind text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notification_deliveries_user_sent_idx
  ON public.notification_deliveries (user_id, sent_at DESC);

ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notification_deliveries_select_own" ON public.notification_deliveries;
DROP POLICY IF EXISTS "notification_deliveries_insert_own" ON public.notification_deliveries;

CREATE POLICY "notification_deliveries_select_own"
  ON public.notification_deliveries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "notification_deliveries_insert_own"
  ON public.notification_deliveries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "follows_update_own" ON public.follows;
CREATE POLICY "follows_update_own"
  ON public.follows
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);;
