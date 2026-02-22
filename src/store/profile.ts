import { create } from 'zustand'

interface ProfileState {
  mainUsername: string | null;
  profileImage: string | null;
  setProfileData: (username: string | null, image: string | null) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  mainUsername: null,
  profileImage: null,
  setProfileData: (mainUsername, profileImage) => set({ mainUsername, profileImage }),
}))
