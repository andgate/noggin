import { supabase } from '@/shared/api/supabase-client'
import { Session, User } from '@supabase/supabase-js'
import React, { ReactNode, useEffect, useState } from 'react'
import { AuthContext } from './auth.context'

export interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Error getting initial session:', error)
        setIsLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      // No need to set loading here as it's for subsequent changes
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const value = {
    session,
    user,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
