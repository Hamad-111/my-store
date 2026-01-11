-- Run this in your Supabase SQL Editor to create the missing 'men_products' table

create table if not exists men_products (
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

-- Enable RLS
alter table men_products enable row level security;

-- Policies for Men Products
-- 1. Allow everyone to view products
create policy "Public men viewable" on men_products for select using (true);

-- 2. Allow authenticated users (admins) to insert, update, and delete
create policy "Admin insert men" on men_products for insert with check (auth.role() = 'authenticated');
create policy "Admin update men" on men_products for update using (auth.role() = 'authenticated');
create policy "Admin delete men" on men_products for delete using (auth.role() = 'authenticated');
