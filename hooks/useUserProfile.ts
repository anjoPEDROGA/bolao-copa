"use client";

import { useUserStore } from "@/stores/userStore";

export function useUserProfile() {
  const profile = useUserStore((state) => state.profile);
  const setName = useUserStore((state) => state.setName);
  const toggleFavoriteTeam = useUserStore(
    (state) => state.toggleFavoriteTeam
  );
  const setFavoriteTeamIds = useUserStore(
    (state) => state.setFavoriteTeamIds
  );
  const resetProfile = useUserStore((state) => state.resetProfile);
  const hasFavoriteTeam = useUserStore((state) => state.hasFavoriteTeam);
  const isProfileReady = useUserStore((state) => state.hasHydrated);

  return {
    profile,
    setName,
    toggleFavoriteTeam,
    setFavoriteTeamIds,
    resetProfile,
    hasFavoriteTeam,
    isProfileReady
  };
}
