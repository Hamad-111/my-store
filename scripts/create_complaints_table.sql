-- Create Complaints Table
create table if not exists complaints (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    email text not null,
    order_id text,
    message text not null,
    status text default 'Open'
);
-- Enable RLS
alter table complaints enable row level security;
-- Policies
-- 1. Anyone (even anon) can submit a complaint
create policy "Public insert complaints" on complaints for
insert with check (true);
-- 2. Only authenticated users (Admins) can view/update/delete
-- (The Admin Dashboard protects the UI, this protects the data layer)
create policy "Admin view complaints" on complaints for
select using (auth.role() = 'authenticated');
create policy "Admin update complaints" on complaints for
update using (auth.role() = 'authenticated');
create policy "Admin delete complaints" on complaints for delete using (auth.role() = 'authenticated');