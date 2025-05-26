"use client"

import { useEffect, useState } from 'react'
import Auth from '@/components/Auth'
import Dashboard from '@/components/Dashboard'
import { supabase } from '@/lib/supabase'

export default function DashboardApp() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }
    getUser()
  }, [])

  if (loading) return <div>Loading...</div>
  if (user) return <Dashboard />
  return <Auth onAuthSuccess={setUser} />
} 