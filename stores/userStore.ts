"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "@/types";

type UserStoreState = {
  profile: UserProfile;
  hasHydrated: boolean;
  setName: (name: string) => void;
  toggleFavoriteTeam: (teamId: string) => void;
  setFavoriteTeamIds: (teamIds: string[]) => void;
  resetProfile: () => void;
  hasFavoriteTeam: (teamId: string) => boolean;
  setHasHydrated: (value: boolean) => void;
};

const initialProfile: UserProfile = {
  name: "",
  favoriteTeamIds: []
};

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      profile: initialProfile,
      hasHydrated: false,
      setName: (name) =>
        set((state) => ({
          profile: {
            ...state.profile,
            name
          }
        })),
      toggleFavoriteTeam: (teamId) =>
        set((state) => {
          const isSelected = state.profile.favoriteTeamIds.includes(teamId);
          return {
            profile: {
              ...state.profile,
              favoriteTeamIds: isSelected
                ? state.profile.favoriteTeamIds.filter((id) => id !== teamId)
                : [...state.profile.favoriteTeamIds, teamId]
            }
          };
        }),
      setFavoriteTeamIds: (teamIds) =>
        set((state) => ({
          profile: {
            ...state.profile,
            favoriteTeamIds: teamIds
          }
        })),
      resetProfile: () => set({ profile: initialProfile }),
      hasFavoriteTeam: (teamId) =>
        get().profile.favoriteTeamIds.includes(teamId),
      setHasHydrated: (value) => set({ hasHydrated: value })
    }),
    {
      name: "bolao-copa-user-profile",
      partialize: (state) => ({ profile: state.profile }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      }
    }
  )
);
