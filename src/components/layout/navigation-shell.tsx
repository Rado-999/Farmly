"use client";

import { Suspense } from "react";

import { NavigationProgress } from "@/components/layout/navigation-progress";

export function NavigationShell() {
  return (
    <Suspense fallback={null}>
      <NavigationProgress />
    </Suspense>
  );
}
