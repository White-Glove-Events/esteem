-- Create invites table for team invitations
create table if not exists invites (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  team_id uuid references teams(id) on delete cascade,
  inviter_id uuid references users(id) on delete set null,
  token text not null unique,
  status text default 'pending', -- pending, accepted, expired, revoked
  created_at timestamp with time zone default now(),
  accepted_at timestamp with time zone
); 