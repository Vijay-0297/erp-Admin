import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { loginRequest, registerRequest } from '../api/authApi'
import { TOKEN_KEY, USER_KEY } from '../utils/constants'

export const AuthContext = createContext(null)

// Decodes the payload of a JWT without verifying the signature (verification
// happens server-side). Used only to read non-sensitive claims like
// expiry/role for client-side UX (route guarding), never for authorization
// decisions that matter for security.
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    // On boot, verify the stored token hasn't already expired so we don't
    // treat a stale token as an active session.
    const stored = localStorage.getItem(TOKEN_KEY)
    if (stored) {
      const claims = decodeJwt(stored)
      const isExpired = claims?.exp && claims.exp * 1000 < Date.now()
      if (isExpired) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setToken(null)
        setUser(null)
      }
    }
    setIsInitializing(false)
  }, [])

  const persistSession = useCallback((accessToken, userPayload) => {
    localStorage.setItem(TOKEN_KEY, accessToken)
    if (userPayload) {
      localStorage.setItem(USER_KEY, JSON.stringify(userPayload))
    }
    setToken(accessToken)
    setUser(userPayload || null)
  }, [])

  const login = useCallback(
    async ({ email, password }) => {
      const { data } = await loginRequest({ email, password })
      // Backend response shape may vary; support a few common conventions
      // without guessing wildly beyond what the auth contract implies.
      const accessToken = data.token || data.accessToken || data.jwt
      const userPayload = data.user || {
        email,
        username: data.username,
        fullName: data.fullName,
        roleId: data.roleId,
        role: data.role,
      }
      persistSession(accessToken, userPayload)
      return userPayload
    },
    [persistSession]
  )

  const register = useCallback(async ({ username, email, password, fullName }) => {
    const { data } = await registerRequest({ username, email, password, fullName })
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isInitializing,
      login,
      register,
      logout,
    }),
    [user, token, isInitializing, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
