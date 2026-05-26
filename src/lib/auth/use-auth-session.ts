"use client";

import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { useSyncExternalStore } from "react";

import { isSupabaseConfigured } from "@/lib/supabase";
import { loadSupabaseClient } from "@/lib/supabase/load-client";
import { logger } from "@/lib/logger";

const SESSION_STUCK_MS = 8000;

export type AuthSessionState =
  | { status: "loading" }
  | { status: "unconfigured" }
  | { status: "anonymous" }
  | { status: "authenticated"; session: Session; user: User };

let authState: AuthSessionState = { status: "loading" };
let isInitialized = false;
let loadWatchdog: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setAuthState(next: AuthSessionState) {
  if (next.status === "authenticated" && authState.status === "authenticated") {
    if (
      authState.user.id === next.user.id &&
      authState.session.access_token === next.session.access_token
    ) {
      return;
    }
  } else if (authState.status === next.status) {
    return;
  }

  authState = next;
  emitChange();
}

function disarmLoadWatchdog() {
  if (loadWatchdog !== undefined) {
    clearTimeout(loadWatchdog);
    loadWatchdog = undefined;
  }
}

function armLoadWatchdog() {
  disarmLoadWatchdog();
  loadWatchdog = setTimeout(() => {
    if (authState.status === "loading") {
      setAuthState({ status: "anonymous" });
    }
  }, SESSION_STUCK_MS);
}

function scheduleEnsureProfile(
  supabase: SupabaseClient,
  user: User,
) {
  setTimeout(() => {
    void Promise.all([
      import("@/lib/auth/ensure-profile"),
      import("@/lib/marketplace/saved-farms"),
    ])
      .then(([{ ensureProfileForAuthUser }, { syncGuestSavedFarms }]) =>
        ensureProfileForAuthUser(supabase, user).then(() =>
          syncGuestSavedFarms(supabase, user.id),
        ),
      )
      .then((syncResult) => {
        if (syncResult && !syncResult.ok) {
          logger.error({
            operation: "auth.useAuthSession.syncGuestSavedFarms",
            message: "Failed to sync guest saved farms after authentication.",
            userId: user.id,
            errorCode: syncResult.error.code,
            error: syncResult.error.message,
          });
        }
      })
      .catch((err) => {
        console.error("[useAuthSession] ensureProfileForAuthUser failed", err);
      });
  }, 0);
}

function setSessionState(session: Session | null) {
  disarmLoadWatchdog();

  if (session?.user) {
    setAuthState({
      status: "authenticated",
      session,
      user: session.user,
    });
    return;
  }

  setAuthState({ status: "anonymous" });
}

function initializeAuthSessionStore() {
  if (isInitialized) {
    return;
  }

  isInitialized = true;

  void (async () => {
    if (!isSupabaseConfigured()) {
      setAuthState({ status: "unconfigured" });
      return;
    }

    const supabase = await loadSupabaseClient();

    if (!supabase) {
      setAuthState({ status: "unconfigured" });
      return;
    }

    armLoadWatchdog();

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error("[useAuthSession] getSession failed", error);
          setAuthState({ status: "anonymous" });
          return;
        }

        setSessionState(data.session);

        if (data.session?.user) {
          scheduleEnsureProfile(supabase, data.session.user);
        }
      })
      .catch((error) => {
        console.error("[useAuthSession] getSession failed", error);
        setAuthState({ status: "anonymous" });
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionState(session);

      if (session?.user) {
        scheduleEnsureProfile(supabase, session.user);
      }
    });

    void subscription;
  })();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  initializeAuthSessionStore();

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return authState;
}

export function useAuthSession(): AuthSessionState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
