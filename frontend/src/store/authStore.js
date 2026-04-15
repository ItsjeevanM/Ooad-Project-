import { create } from 'zustand'

import { fetchCurrentUser, loginRequest } from '../api/authApi'

const TOKEN_KEY = 'edusphere_access_token'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  isAuthenticated: false,
  isInitializing: true,

  initializeAuth: async () => {
    const token = localStorage.getItem(TOKEN_KEY)

    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isInitializing: false })
      return
    }

    try {
      const user = await fetchCurrentUser()
      set({ user, token, isAuthenticated: true, isInitializing: false })
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      set({ user: null, token: null, isAuthenticated: false, isInitializing: false })
    }
  },

  login: async (payload) => {
    const loginData = await loginRequest(payload)
    const accessToken = loginData?.accessToken

    if (!accessToken) {
      throw new Error('Access token not found in response')
    }

    localStorage.setItem(TOKEN_KEY, accessToken)
    const user = await fetchCurrentUser()

    set({
      user,
      token: accessToken,
      isAuthenticated: true,
      isInitializing: false,
    })

    return user
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ user: null, token: null, isAuthenticated: false, isInitializing: false })
  },
}))
