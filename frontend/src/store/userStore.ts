import { create } from 'zustand'
import type { User } from '../types'
import { usersApi } from '../api/users'

interface UserState {
  user: User | null
  loading: boolean
  fetchUser: () => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,

  fetchUser: async () => {
    try {
      set({ loading: true })
      const user = await usersApi.me()
      set({ user, loading: false })
    } catch (e) {
      console.error('Failed to fetch user:', e)
      set({ loading: false })
    }
  },
}))
