import { DEFAULT_POST_AUTH_PATH } from "@/lib/auth/constants";
import { ensureProfileForAuthUser } from "@/lib/auth/ensure-profile";
import {
  getAuthErrorMessage,
  getSignupWithoutUserMessage,
} from "@/lib/auth/messages";
import type { SignupFormValues } from "@/lib/auth/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type SignupResult =
  | { status: "session"; redirectTo: string }
  | { status: "confirm-email" }
  | { status: "error"; message: string };

export async function completeSignup(
  supabase: SupabaseClient,
  values: SignupFormValues,
): Promise<SignupResult> {
  const email = values.email.trim();

  const { data, error } = await supabase.auth.signUp({
    email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName.trim(),
      },
    },
  });

  if (error) {
    return {
      status: "error",
      message: getAuthErrorMessage(error),
    };
  }

  if (!data.user) {
    return {
      status: "error",
      message: getSignupWithoutUserMessage(),
    };
  }

  if (data.session) {
    // Auth succeeded — sync profile in the background (same pattern as login).
    // Avoid blocking redirect; onAuthStateChange may also run ensureProfile.
    setTimeout(() => {
      void ensureProfileForAuthUser(supabase, data.user!).catch((err) => {
        console.error("[completeSignup] ensureProfileForAuthUser failed", err);
      });
    }, 0);

    return { status: "session", redirectTo: DEFAULT_POST_AUTH_PATH };
  }

  return { status: "confirm-email" };
}
