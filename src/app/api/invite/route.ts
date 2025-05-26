import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { email, team_id, inviter_id } = await req.json()
  if (!email || !team_id || !inviter_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  // Generate a unique token
  const token = randomBytes(32).toString('hex')
  // Store invite in DB
  const { data, error } = await supabase
    .from('invites')
    .insert({ email, team_id, inviter_id, token })
    .select()
    .single()
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  // In a real app, send an email here with the invite link
  const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/invite/accept?token=${token}`
  return NextResponse.json({ invite: data, inviteLink })
} 