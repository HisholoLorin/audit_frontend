import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN_KEY = 'audit_access_token'
const REFRESH_TOKEN_KEY = 'audit_refresh_token'
const USER_KEY = 'audit_user'

interface AuthUser {
  id: number
  username: string
  email: string
  full_name: string
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    refreshToken: string
    setRefreshToken: (refreshToken: string) => void
    reset: () => void
  }
}

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function saveUser(user: AuthUser | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  } catch {
    // ignore storage errors
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const savedAccessToken = getCookie(ACCESS_TOKEN_KEY) || ''
  const savedRefreshToken = getCookie(REFRESH_TOKEN_KEY) || ''
  const savedUser = loadUser()

  return {
    auth: {
      user: savedUser,
      setUser: (user) => {
        saveUser(user)
        set((state) => ({ ...state, auth: { ...state.auth, user } }))
      },
      accessToken: savedAccessToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN_KEY, accessToken)
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      refreshToken: savedRefreshToken,
      setRefreshToken: (refreshToken) =>
        set((state) => {
          setCookie(REFRESH_TOKEN_KEY, refreshToken)
          return { ...state, auth: { ...state.auth, refreshToken } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN_KEY)
          removeCookie(REFRESH_TOKEN_KEY)
          saveUser(null)
          return {
            ...state,
            auth: {
              ...state.auth,
              user: null,
              accessToken: '',
              refreshToken: '',
            },
          }
        }),
    },
  }
})
