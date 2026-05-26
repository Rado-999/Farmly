"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { FarmerViewerRelationship } from "@/lib/farmers/types";

type FarmerRelationshipContextValue = FarmerViewerRelationship & {
  setIsFollowing: (next: boolean) => void;
};

const FarmerRelationshipContext =
  createContext<FarmerRelationshipContextValue | null>(null);

type FarmerRelationshipProviderProps = {
  initialRelationship: FarmerViewerRelationship;
  children: ReactNode;
};

export function FarmerRelationshipProvider({
  initialRelationship,
  children,
}: FarmerRelationshipProviderProps) {
  const [isFollowing, setIsFollowing] = useState(initialRelationship.isFollowing);

  useEffect(() => {
    setIsFollowing(initialRelationship.isFollowing);
  }, [initialRelationship.farmerProfileId, initialRelationship.isFollowing]);

  const value = useMemo(
    () => ({
      ...initialRelationship,
      isFollowing,
      setIsFollowing,
    }),
    [initialRelationship, isFollowing],
  );

  return (
    <FarmerRelationshipContext.Provider value={value}>
      {children}
    </FarmerRelationshipContext.Provider>
  );
}

export function useFarmerRelationship(farmerProfileId: string) {
  const value = useContext(FarmerRelationshipContext);

  if (!value || value.farmerProfileId !== farmerProfileId) {
    return null;
  }

  return value;
}
