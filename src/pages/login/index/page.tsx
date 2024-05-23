import React, { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../../utils/supabase'
import { useNavigate } from 'react-router-dom'

const useRedirectToDashboard = (session: Session | null) => {
  const navigate = useNavigate()

  useEffect(() => {
    if (session) {
      navigate('/dashboard')
    }
  }, [session, navigate])
}

const LoginPage: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null)
  useRedirectToDashboard(session)

  useEffect(() => {
    const fetchSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      setSession(sessionData?.session ?? null)
    }

    fetchSession()

    const authListener = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => authListener.data.subscription.unsubscribe()
  }, [])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="w-full max-w-md px-4">
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['google']} />
      </div>
    </div>
  )
}

export default LoginPage
