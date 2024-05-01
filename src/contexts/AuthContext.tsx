import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../utils/supabase'
import ErrorBoundary from '../components/ErrorBoundary'

interface AuthContextType {
  session: Session | null
  user: User | null
  signOut: () => Promise<void>
}

const initialAuthContext: AuthContextType = {
  session: null,
  user: null,
  signOut: async () => {},
}

const AuthContext = createContext<AuthContextType>(initialAuthContext)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) throw error
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error: any) {
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session || null)
      setUser(session?.user ?? null)
    })

    fetchSession()

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error: any) {
      setError(error)
    }
  }

  const authContextValue: AuthContextType = {
    session,
    user,
    signOut,
  }

  if (error) {
    return <ErrorBoundary errorCode={500} errorMessage={error} />
  }

  return <AuthContext.Provider value={authContextValue}>{!loading && children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  return useContext(AuthContext)
}
