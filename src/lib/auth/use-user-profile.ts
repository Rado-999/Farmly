"use client";

import { useEffect, useState } from "react";

import {
  fetchUserProfile,
  isFarmerUser,
  type UserProfile,
} from "@/lib/auth/profile";
import {
  useAuthSession,
  type AuthSessionState,
} from "@/lib/auth/use-auth-session";
import { createSupabaseClient } from "@/lib/supabase";

type UserProfileState = {
  status: "idle" | "loading" | "ready";
  profile: UserProfile | null;
};

export function useUserProfile(): UserProfileState & {
  isFarmer: boolean;
  authState: AuthSessionState;
} {
  const authState = useAuthSession();
  const [state, setState] = useState<UserProfileState>({
    status: "idle",
    profile: null,
  });

  useEffect(() => {
    if (authState.status !== "authenticated") {
      setState({ status: "idle", profile: null });
      return;
    }

    let isMounted = true;
    const supabase = createSupabaseClient();

    if (!supabase) {
      setState({ status: "ready", profile: null });
      return;
    }

    setState({ status: "loading", profile: null });

    void fetchUserProfile(supabase, authState.user.id).then((profile) => {
      if (!isMounted) {
        return;
      }

      setState({ status: "ready", profile });
    });

    return () => {
      isMounted = false;
    };
  }, [authState]);

  return {
    status: state.status,
    profile: state.profile,
    isFarmer: state.profile ? isFarmerUser(state.profile) : false,
    authState,
  };
}
