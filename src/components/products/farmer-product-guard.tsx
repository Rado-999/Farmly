"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { ProfileSkeleton } from "@/components/profile/profile-skeleton";
import { PROFILE_PATH } from "@/lib/auth/constants";
import { getFarmerProductAccess } from "@/lib/products/access";
import type { FarmerProductAccess } from "@/lib/products/types";
import { createSupabaseClient } from "@/lib/supabase";

type FarmerProductGuardProps = {
  children: (access: FarmerProductAccess) => ReactNode;
};

export function FarmerProductGuard({ children }: FarmerProductGuardProps) {
  const router = useRouter();
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "ready"; access: FarmerProductAccess }
    | { status: "blocked"; reason: string; href: string; label: string }
  >({ status: "loading" });

  useEffect(() => {
    async function checkAccess() {
      const supabase = createSupabaseClient();

      if (!supabase) {
        setState({
          status: "blocked",
          reason: "Няма връзка със сървъра.",
          href: PROFILE_PATH,
          label: "Към профила",
        });
        return;
      }

      const result = await getFarmerProductAccess(supabase);

      if (!result.ok) {
        if (result.reason === "anonymous") {
          router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
          return;
        }

        if (result.reason === "incomplete_profile") {
          setState({
            status: "blocked",
            reason: "Попълнете профила си, за да добавяте продукти.",
            href: PROFILE_PATH,
            label: "Към профила",
          });
          return;
        }

        setState({
          status: "blocked",
          reason: "Трябва да сте фермер, за да управлявате продукти.",
          href: PROFILE_PATH,
          label: "Към профила",
        });
        return;
      }

      setState({ status: "ready", access: result.access });
    }

    void checkAccess();
  }, [router]);

  if (state.status === "loading") {
    return <ProfileSkeleton />;
  }

  if (state.status === "blocked") {
    return (
      <div className="page-shell max-w-lg page-y text-center">
        <p className="text-base text-stone-700">{state.reason}</p>
        <Link
          href={state.href}
          className="mt-6 inline-flex cursor-pointer rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-white"
        >
          {state.label}
        </Link>
      </div>
    );
  }

  return <>{children(state.access)}</>;
}
