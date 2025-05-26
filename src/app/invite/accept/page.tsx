"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Auth from "@/components/Auth"
import { User } from '@supabase/supabase-js'

interface Invite {
  id: string
  email: string
  team_id: string
  inviter_id: string
  token: string
  status: string
  created_at: string
  accepted_at: string | null
}

export default function AcceptInvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [invite, setInvite] = useState<Invite | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const fetchInvite = async () => {
      if (!token) return
      const { data, error } = await supabase
        .from("invites")
        .select("*")
        .eq("token", token)
        .single()
      if (error || !data) {
        setMessage("Invalid or expired invite.")
        setLoading(false)
        return
      }
      setInvite(data)
      setLoading(false)
    }
    fetchInvite()
  }, [token])

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    getUser()
  }, [])

  const handleAccept = async () => {
    if (!user || !invite) return
    setAccepting(true)
    // Add user to team_members
    const { error: memberError } = await supabase
      .from("team_members")
      .insert({ user_id: user.id, team_id: invite.team_id, role: "member" })
    if (memberError) {
      setMessage("Error adding you to the team: " + memberError.message)
      setAccepting(false)
      return
    }
    // Mark invite as accepted
    await supabase
      .from("invites")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", invite.id)
    setMessage("Success! You have joined the team.")
    setAccepting(false)
    setTimeout(() => router.push("/"), 2000)
  }

  if (loading) return <div className="text-white p-8">Loading...</div>
  if (message) return <div className="text-white p-8">{message}</div>

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#161038] to-[#3E2D9E]">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Accept Team Invite</h1>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          {invite ? `You've been invited to join team ID: ${invite.team_id}` : "Invalid invite."}
        </p>
        {!user ? (
          <Auth onAuthSuccess={setUser} />
        ) : (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {accepting ? "Joining..." : "Accept Invite & Join Team"}
          </button>
        )}
      </div>
    </div>
  )
} 