alter table team_members
drop constraint if exists team_members_user_id_fkey;

alter table team_members
add constraint team_members_user_id_fkey
foreign key (user_id) references users(id) on delete cascade;
