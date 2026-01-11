# Supabase Setup Guide

This project uses Supabase for the backend (Database & Authentication). Follow these steps to set it up.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign in.
2. Click **"New Project"**.
3. Enter a name (e.g., `my-store`) and a secure database password.
4. Choose a region close to you.
5. Click **"Create new project"**.

## 2. Get API Credentials

1. Once the project is created, go to **Project Settings** (gear icon) -> **API**.
2. Copy the **Project URL**.
3. Copy the **anon public** key.
4. Open the `.env` file in your project root and paste them:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. Create the Database Tables

1. Go to the **SQL Editor** (terminal icon) in the Supabase dashboard.
2. Click **"New Query"**.
3. Paste the following SQL code and run it to create the separate tables:

```sql
-- Drop old tables if they exist
drop table if exists products;
drop table if exists unstitched_products;
drop table if exists ready_to_wear_products;
drop table if exists accessories_products;

-- 1. Unstitched Products Table (Women's Unstitched)
create table unstitched_products (
  id text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text,
  brand text,
  category text,
  main_category text, -- Added for consistency
  price numeric,
  image text,
  images text[],
  description text,
  details text,
  unstitched_type text,
  style text,
  pieces text,
  fabric text,
  color text,
  sale_percent numeric default 0,
  in_stock boolean default true,
  tag text,
  popularity numeric default 0
);

-- 2. Ready to Wear Products Table
create table ready_to_wear_products (
  id text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text,
  brand text,
  category text,
  main_category text, -- Added for consistency
  price numeric,
  image text,
  images text[],
  description text,
  details text,
  rtw_type text,
  rtw_sub_type text,
  size text,
  fabric text,
  color text,
  sale_percent numeric default 0,
  in_stock boolean default true,
  tag text,
  popularity numeric default 0
);

-- 3. Accessories Products Table
create table accessories_products (
  id text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text,
  brand text,
  category text,
  main_category text, -- Stores 'BAGS', 'JEWELLRY', etc.
  price numeric,
  image text,
  images text[],
  description text,
  details text,
  sub_category text,
  gender text,
  material text,
  color text,
  tone text,
  size text,
  fabric text,
  sale_percent numeric default 0,
  in_stock boolean default true,
  tag text,
  popularity numeric default 0
);

-- Enable Row Level Security (RLS)
alter table unstitched_products enable row level security;
alter table ready_to_wear_products enable row level security;
alter table accessories_products enable row level security;

-- Policies for Unstitched
create policy "Public unstitched viewable" on unstitched_products for select using (true);
create policy "Admin insert unstitched" on unstitched_products for insert with check (auth.role() = 'authenticated');
create policy "Admin update unstitched" on unstitched_products for update using (auth.role() = 'authenticated');

-- Policies for Ready to Wear
create policy "Public rtw viewable" on ready_to_wear_products for select using (true);
create policy "Admin insert rtw" on ready_to_wear_products for insert with check (auth.role() = 'authenticated');
create policy "Admin update rtw" on ready_to_wear_products for update using (auth.role() = 'authenticated');

-- Policies for Accessories
create policy "Public accessories viewable" on accessories_products for select using (true);
create policy "Admin insert accessories" on accessories_products for insert with check (auth.role() = 'authenticated');
create policy "Admin update accessories" on accessories_products for update using (auth.role() = 'authenticated');

-- 4. Brands Table
create table brands (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  category text, -- 'women', 'men', 'accessories', 'all'
  logo text,
  is_active boolean default true
);

-- Policies for Brands
alter table brands enable row level security;
create policy "Public brands viewable" on brands for select using (true);
create policy "Admin insert brands" on brands for insert with check (auth.role() = 'authenticated');
create policy "Admin update brands" on brands for update using (auth.role() = 'authenticated');
create policy "Admin delete brands" on brands for delete using (auth.role() = 'authenticated');
```

## 4. User Roles Setup (Admin vs User)

To properly handle Admin vs User roles in the database, run this SQL in the **SQL Editor**:

```sql
-- 1. Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text default 'user', -- 'admin' or 'user'
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Policies
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- 4. Trigger to automatically create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (new.id, new.email, 'user', new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid error
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Backfill existing users (if you already signed up)
insert into public.profiles (id, email, role, full_name)
select id, email, 'user', raw_user_meta_data->>'name'
from auth.users
on conflict (id) do nothing;

-- 6. MAKE YOURSELF ADMIN (Run this line!)
update public.profiles set role = 'admin' where email = 'admin@mystore.com';

-- OR if you used a different email:
-- update public.profiles set role = 'admin' where email = 'your_email@example.com';
```

## 5. Seed the Database

1. Start your app: `npm run dev`
2. Log in as Admin:
    * Email: `admin@mystore.com`
    * Password: `admin123`
3. Go to the **Admin Dashboard**.
4. Click the green **"Seed Database to Supabase"** button.
5. Wait for the success message.

## 6. Troubleshooting: Email Verification

If you are unable to verify your email (e.g., running on localhost without an email server), you can disable email confirmation in Supabase:

1. Go to your **Supabase Dashboard**.
2. Navigate to **Authentication** -> **Providers**.
3. Click on **Email**.
4. Toggle **OFF** "Confirm email".
5. **Save** the changes.
6. Now, any new user you sign up will be automatically verified.

**To fix an existing unverified user:**

1. Go to **Authentication** -> **Users**.
2. Find the user and click the three dots (more options).
3. Click **"Confirm User"** (if available) or simply delete the user and sign up again after disabling confirmation.

## 7. Fix Database Permissions (Run this if you get "Row Level Security" errors)

If you see an error like `new row violates row-level security policy`, run this SQL code to reset and fix all permissions:

```sql
-- Fix RLS Policies for All Product Tables

-- 1. Unstitched Products
alter table unstitched_products enable row level security;
drop policy if exists "Public unstitched viewable" on unstitched_products;
drop policy if exists "Admin insert unstitched" on unstitched_products;
drop policy if exists "Admin update unstitched" on unstitched_products;
drop policy if exists "Admin delete unstitched" on unstitched_products;

create policy "Public unstitched viewable" on unstitched_products for select using (true);
create policy "Admin insert unstitched" on unstitched_products for insert with check (auth.role() = 'authenticated');
create policy "Admin update unstitched" on unstitched_products for update using (auth.role() = 'authenticated');
create policy "Admin delete unstitched" on unstitched_products for delete using (auth.role() = 'authenticated');

-- 2. Ready to Wear Products
alter table ready_to_wear_products enable row level security;
drop policy if exists "Public rtw viewable" on ready_to_wear_products;
drop policy if exists "Admin insert rtw" on ready_to_wear_products;
drop policy if exists "Admin update rtw" on ready_to_wear_products;
drop policy if exists "Admin delete rtw" on ready_to_wear_products;

create policy "Public rtw viewable" on ready_to_wear_products for select using (true);
create policy "Admin insert rtw" on ready_to_wear_products for insert with check (auth.role() = 'authenticated');
create policy "Admin update rtw" on ready_to_wear_products for update using (auth.role() = 'authenticated');
create policy "Admin delete rtw" on ready_to_wear_products for delete using (auth.role() = 'authenticated');

-- 3. Accessories Products
alter table accessories_products enable row level security;
drop policy if exists "Public accessories viewable" on accessories_products;
drop policy if exists "Admin insert accessories" on accessories_products;
drop policy if exists "Admin update accessories" on accessories_products;
drop policy if exists "Admin delete accessories" on accessories_products;

create policy "Public accessories viewable" on accessories_products for select using (true);
create policy "Admin insert accessories" on accessories_products for insert with check (auth.role() = 'authenticated');
create policy "Admin update accessories" on accessories_products for update using (auth.role() = 'authenticated');
create policy "Admin delete accessories" on accessories_products for delete using (auth.role() = 'authenticated');

-- 4. Brands
alter table brands enable row level security;
drop policy if exists "Public brands viewable" on brands;
drop policy if exists "Admin insert brands" on brands;
drop policy if exists "Admin update brands" on brands;
drop policy if exists "Admin delete brands" on brands;

create policy "Public brands viewable" on brands for select using (true);
create policy "Admin insert brands" on brands for insert with check (auth.role() = 'authenticated');
create policy "Admin update brands" on brands for update using (auth.role() = 'authenticated');
create policy "Admin delete brands" on brands for delete using (auth.role() = 'authenticated');

-- 5. Orders Table (Run this to enable Order Management)
create table orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  total_amount numeric,
  status text default 'Pending',
  items jsonb,
  shipping_address jsonb
);

-- Policies for Orders
alter table orders enable row level security;
create policy "Users can view own orders" on orders for select using (auth.uid() = user_id);
create policy "Users can insert own orders" on orders for insert with check (auth.uid() = user_id);
create policy "Admin view all orders" on orders for select using (true); -- Simplification for admin panel visibility
create policy "Admin update orders" on orders for update using (true);

-- 6. Men Products Table
create table men_products (
  id text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text,
  brand text,
  category text,
  sub_category text, -- 'Kurta', 'Shalwar Kameez', etc.
  main_category text default 'MEN',
  price numeric,
  image text,
  images text[],
  description text,
  details text,
  fabric text,
  color text,
  size text,
  sale_percent numeric default 0,
  in_stock boolean default true,
  tag text,
  popularity numeric default 0
);

-- Policies for Men Products
alter table men_products enable row level security;
create policy "Public men viewable" on men_products for select using (true);
create policy "Admin insert men" on men_products for insert with check (auth.role() = 'authenticated');
create policy "Admin update men" on men_products for update using (auth.role() = 'authenticated');
create policy "Admin delete men" on men_products for delete using (auth.role() = 'authenticated');
```
