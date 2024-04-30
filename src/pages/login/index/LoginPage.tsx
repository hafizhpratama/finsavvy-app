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
      navigate('/')
    }
  }, [session, navigate])
}

const LoginPage: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null)
  useRedirectToDashboard(session)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['google']} />
}

export default LoginPage
