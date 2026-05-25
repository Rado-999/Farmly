"use client";

import type { Session, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

import { ensureProfileForAuthUser } from "@/lib/auth/ensure-profile";
import { syncGuestSavedFarms } from "@/lib/marketplace/saved-farms";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

const SESSION_STUCK_MS = 8000;

export type AuthSessionState =
  | { status: "loading" }
  | { status: "unconfigured" }
  | { status: "anonymous" }
  | { status: "authenticated"; session: Session; user: User };

function scheduleEnsureProfile(
  supabase: NonNullable<ReturnType<typeof createSupabaseClient>>,
  user: User,
) {
  setTimeout(() => {
    void ensureProfileForAuthUser(supabase, user)
      .then(() => syncGuestSavedFarms(supabase, user.id))
      .catch((err) => {
        console.error("[useAuthSession] ensureProfileForAuthUser failed", err);
      });
  }, 0);
}

export function useAuthSession(): AuthSessionState {
  const [state, setState] = useState<AuthSessionState>({ status: "loading" });

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState({ status: "unconfigured" });
      return;
    }

    const supabase = createSupabaseClient();

    if (!supabase) {
      setState({ status: "unconfigured" });
      return;
    }

    const client = supabase;
    let isMounted = true;
    let loadWatchdog: ReturnType<typeof setTimeout> | undefined;

    function disarmLoadWatchdog() {
      if (loadWatchdog !== undefined) {
        clearTimeout(loadWatchdog);
        loadWatchdog = undefined;
      }
    }

    function armLoadWatchdog() {
      disarmLoadWatchdog();
      loadWatchdog = setTimeout(() => {
        setState((prev) =>
          prev.status === "loading" ? { status: "anonymous" } : prev,
        );
      }, SESSION_STUCK_MS);
    }

    function setAuthState(session: Session | null) {
      disarmLoadWatchdog();
      setState((current) => {
        if (session?.user) {
          if (
            current.status === "authenticated" &&
            current.user.id === session.user.id
          ) {
            return current;
          }

          return {
            status: "authenticated",
            session,
            user: session.user,
          };
        }

        if (current.status === "anonymous") {
          return current;
        }

        return { status: "anonymous" };
      });
    }

    armLoadWatchdog();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      setAuthState(session);

      if (session?.user) {
        scheduleEnsureProfile(client, session.user);
      }
    });

    return () => {
      isMounted = false;
      disarmLoadWatchdog();
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
