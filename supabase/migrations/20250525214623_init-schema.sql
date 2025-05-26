-- Teams table
create table if not exists teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Team members table
create table if not exists team_members (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  role text default 'member',
  joined_at timestamp with time zone default now(),
  unique(user_id, team_id)
);

-- Goals table
create table if not exists goals (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  status text default 'pending',
  grade integer,
  due_date timestamp with time zone not null,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  user_id uuid references auth.users(id) on delete cascade,
  team_id uuid references teams(id) on delete set null
);