'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface Team {
  id: string
  name: string
}

interface TeamMember {
  id: string
  user_id: string
  team_id: string
  role: 'admin' | 'member'
  joined_at: string
  user: { email: string; first_name: string; last_name: string }[]
}

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [teamName, setTeamName] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [refreshMembers, setRefreshMembers] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  useEffect(() => {
    const getUserAndTeams = async () => {
      const { data: userData } = await supabase.auth.getUser()
      setUser(userData.user)
      if (userData.user) {
        // Fetch user profile from custom users table
        const { data: profile } = await supabase
          .from('users')
          .select('id, email, first_name, last_name')
          .eq('id', userData.user.id)
          .single()
        setUserProfile(profile)
        const { data: teamMembers, error } = await supabase
          .from('team_members')
          .select('team:teams(id, name)')
          .eq('user_id', userData.user.id)
        if (!error && teamMembers) {
          setTeams(teamMembers.flatMap((tm: { team: Team[] }) => tm.team))
        }
      }
      setLoading(false)
    }
    getUserAndTeams()
  }, [])

  useEffect(() => {
    if (selectedTeam) {
      fetchMembers(selectedTeam.id)
    }
    // eslint-disable-next-line
  }, [selectedTeam, refreshMembers])

  const fetchMembers = async (teamId: string) => {
    const { data, error } = await supabase
      .from('team_members')
      .select('id, user_id, team_id, role, joined_at, user:users(email, first_name, last_name)')
      .eq('team_id', teamId)
    if (!error && data) setMembers(data)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamName.trim() || !user) return
    setCreating(true)
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([{ name: teamName }])
      .select()
      .single()
    if (teamError) {
      alert('Error creating team: ' + teamError.message)
      setCreating(false)
      return
    }
    const { error: memberError } = await supabase
      .from('team_members')
      .insert([{ user_id: user.id, team_id: team.id, role: 'admin' }])
    if (memberError) {
      alert('Error adding user to team: ' + memberError.message)
      setCreating(false)
      return
    }
    setTeams([...teams, team])
    setTeamName('')
    setCreating(false)
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !selectedTeam || !userProfile) return
    setInviting(true)
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          team_id: selectedTeam.id,
          inviter_id: userProfile.id,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        alert(result.error || 'Failed to send invite')
        setInviting(false)
        return
      }
      // For now, show the invite link (in a real app, this would be emailed)
      alert(`Invite link: ${result.inviteLink}\n\nSend this link to your colleague. They must sign up or log in to join your team.`)
      setInviteEmail('')
      setInviting(false)
      setRefreshMembers((r) => !r)
    } catch (error) {
      alert('An unexpected error occurred: ' + error)
      setInviting(false)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'member') => {
    await supabase
      .from('team_members')
      .update({ role: newRole })
      .eq('id', memberId)
    setRefreshMembers((r) => !r)
  }

  const handleRemoveMember = async (memberId: string) => {
    await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
    setRefreshMembers((r) => !r)
  }

  const isAdmin = (teamId: string) => {
    const member = members.find((m) => m.user_id === user?.id)
    return member?.role === 'admin'
  }

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not signed in</div>

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#161038] to-[#3E2D9E]">
      {/* Side Nav */}
      <aside className="hidden md:flex flex-col w-56 bg-[#161038] text-white p-6 space-y-4 shadow-lg">
        <div className="flex items-center gap-4 mb-8">
          <img src="/logo.png" alt="circles logo" className="w-20 h-20" />
          <span className="text-3xl font-normal lowercase tracking-wide">circles</span>
        </div>
        <nav className="flex flex-col gap-4">
          <a href="#" className="text-gray-300 hover:text-white font-medium">Dashboard</a>
          <a href="#" className="text-gray-300 hover:text-white font-medium">Teams</a>
          <a href="#" className="text-gray-300 hover:text-white font-medium">Goals</a>
        </nav>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Nav */}
        <header className="flex items-center justify-between px-6 py-4 bg-transparent shadow-none">
          <div className="md:hidden flex items-center gap-2 text-xl font-bold text-white lowercase tracking-wide">
            <img src="/logo.png" alt="circles logo" className="w-7 h-7" />
            circles
          </div>
          <div className="flex-1" />
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((open) => !open)}
              className="p-2 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 shadow flex items-center justify-center focus:outline-none"
              aria-label="Settings"
            >
              {/* Gear Icon SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-1.14 1.952-1.14 2.252 0a1.724 1.724 0 002.573 1.01c.993-.64 2.296.263 1.96 1.37a1.724 1.724 0 001.516 2.36c1.19.09 1.67 1.64.8 2.36a1.724 1.724 0 000 2.62c.87.72.39 2.27-.8 2.36a1.724 1.724 0 00-1.516 2.36c.336 1.107-.967 2.01-1.96 1.37a1.724 1.724 0 00-2.573 1.01c-.3 1.14-1.952 1.14-2.252 0a1.724 1.724 0 00-2.573-1.01c-.993.64-2.296-.263-1.96-1.37a1.724 1.724 0 00-1.516-2.36c-1.19-.09-1.67-1.64-.8-2.36a1.724 1.724 0 000-2.62c-.87-.72-.39-2.27.8-2.36a1.724 1.724 0 001.516-2.36c-.336-1.107.967-2.01 1.96-1.37.99.64 2.293-.263 2.573-1.01z" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50">
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>
        {/* Page Content */}
        <main className="flex flex-col items-center justify-center flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4 text-white">
            Welcome, {userProfile ? `${userProfile.first_name}` : user?.email}!
          </h1>
          <div className="w-full max-w-md mb-8 bg-white dark:bg-gray-800 p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Your Teams</h2>
            <ul className="mb-4">
              {teams.length === 0 && <li className="text-gray-500 dark:text-gray-400">No teams yet.</li>}
              {teams.map((team) => (
                <li key={team.id} className="py-1 flex items-center justify-between text-gray-900 dark:text-white">
                  <span>{team.name}</span>
                  <button
                    className="ml-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={() => setSelectedTeam(team)}
                  >
                    Manage Members
                  </button>
                </li>
              ))}
            </ul>
            <form onSubmit={handleCreateTeam} className="flex gap-2">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="New team name"
                className="flex-1 px-2 py-1 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                required
              />
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-1 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-400"
              >
                {creating ? 'Creating...' : 'Create Team'}
              </button>
            </form>
          </div>

          {selectedTeam && (
            <div className="w-full max-w-md p-4 border rounded bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Members of {selectedTeam.name}</h3>
                <button onClick={() => setSelectedTeam(null)} className="text-sm text-gray-500 dark:text-gray-400">Close</button>
              </div>
              <ul className="mb-4">
                {members.map((member) => {
                  const user = member.user[0];
                  if (!user) return null;
                  const displayName = `${user.first_name} (${user.email})`;
                  return (
                    <li key={member.id} className="flex flex-col py-1 text-gray-900 dark:text-white">
                      <div className="flex justify-between items-center">
                        <span>{displayName}</span>
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 ml-2">{member.role}</span>
                        {isAdmin(selectedTeam.id) && member.user_id !== userProfile?.id && (
                          <>
                            <select
                              value={member.role}
                              onChange={e => handleRoleChange(member.id, e.target.value as 'admin' | 'member')}
                              className="ml-2 px-1 py-0.5 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                            >
                              <option value="member">member</option>
                              <option value="admin">admin</option>
                            </select>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="ml-2 px-2 py-1 text-xs bg-red-200 dark:bg-red-700 text-red-800 dark:text-red-200 rounded hover:bg-red-300 dark:hover:bg-red-600"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                      <pre className="text-xs bg-gray-800 text-gray-100 p-1 mt-1 rounded">{JSON.stringify(user, null, 2)}</pre>
                    </li>
                  )
                })}
              </ul>
              {isAdmin(selectedTeam.id) && (
                <form onSubmit={handleInvite} className="flex gap-2 mb-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Invite by email"
                    className="flex-1 px-2 py-1 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    required
                  />
                  <button
                    type="submit"
                    disabled={inviting}
                    className="px-4 py-1 bg-green-600 dark:bg-green-500 text-white rounded hover:bg-green-700 dark:hover:bg-green-400"
                  >
                    {inviting ? 'Inviting...' : 'Invite'}
                  </button>
                </form>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
} 