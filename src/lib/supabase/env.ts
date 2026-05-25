type SupabasePublicEnv = {
  url: string;
  publishableKey: string;
};

type SupabaseAdminEnv = SupabasePublicEnv & {
  serviceRoleKey: string;
};

const PUBLIC_ENV_ERROR =
  "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.";

const ADMIN_ENV_ERROR =
  "Supabase admin access is not configured. Add SUPABASE_SERVICE_ROLE_KEY to your server environment.";

export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    return null;
  }

  return { url, publishableKey };
}

export function getSupabasePublicEnvOrThrow(): SupabasePublicEnv {
  const env = getSupabasePublicEnv();

  if (!env) {
    throw new Error(PUBLIC_ENV_ERROR);
  }

  return env;
}

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicEnv() !== null;
}

export function getSupabaseAdminEnv(): SupabaseAdminEnv | null {
  const publicEnv = getSupabasePublicEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!publicEnv || !serviceRoleKey) {
    return null;
  }

  return {
    ...publicEnv,
    serviceRoleKey,
  };
}

export function getSupabaseAdminEnvOrThrow(): SupabaseAdminEnv {
  const env = getSupabaseAdminEnv();

  if (!env) {
    throw new Error(ADMIN_ENV_ERROR);
  }

  return env;
}
