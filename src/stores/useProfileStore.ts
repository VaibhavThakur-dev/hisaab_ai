import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface ProfileData {
  name: string
  email: string
  image?: string
  hasPassword: boolean
  createdAt: string
}

interface ProfileState {
  profile: ProfileData | null
  isLoading: boolean
  setProfile: (profile: ProfileData | null) => void
  updateName: (name: string) => void
  setLoading: (loading: boolean) => void
}

const useProfileStore = create<ProfileState>()(
  devtools(
    (set) => ({
      profile: null,
      isLoading: false,
      setProfile: (profile) => set({ profile }),
      updateName: (name) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, name } : null,
        })),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    { name: 'profile-store' }
  )
)

export default useProfileStore
