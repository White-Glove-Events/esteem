-- 1. Create the users table
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique
);

-- 2. Create a function to sync new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- 3. Create a trigger to call the function after signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
