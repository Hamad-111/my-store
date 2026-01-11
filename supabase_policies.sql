-- FIX: New Row Violates Row-Level Security Policy (UPDATED)
-- INSTRUCTIONS: Copy and paste this code into your Supabase Dashboard > SQL Editor and click RUN.
-- ==========================================
-- 1. TABLE POLICIES (Allow inserting products)
-- ==========================================
-- Unstitched Products
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."unstitched_products";
CREATE POLICY "Enable insert for authenticated users" ON "public"."unstitched_products" FOR
INSERT TO authenticated WITH CHECK (true);
-- Ready To Wear Products
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."ready_to_wear_products";
CREATE POLICY "Enable insert for authenticated users" ON "public"."ready_to_wear_products" FOR
INSERT TO authenticated WITH CHECK (true);
-- Accessories Products
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."accessories_products";
CREATE POLICY "Enable insert for authenticated users" ON "public"."accessories_products" FOR
INSERT TO authenticated WITH CHECK (true);
-- Men Products
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."men_products";
CREATE POLICY "Enable insert for authenticated users" ON "public"."men_products" FOR
INSERT TO authenticated WITH CHECK (true);
-- Brands
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."brands";
CREATE POLICY "Enable insert for authenticated users" ON "public"."brands" FOR
INSERT TO authenticated WITH CHECK (true);
-- ==========================================
-- 2. STORAGE POLICIES (Allow uploading images)
-- ==========================================
-- IMPORTANT: This assumes your bucket is named 'products'
-- Allow uploads
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'products');
-- Allow updates (if needed)
CREATE POLICY "Allow authenticated updates" ON storage.objects FOR
UPDATE TO authenticated WITH CHECK (bucket_id = 'products');
-- Allow public viewing (usually handled by "Public Bucket" setting, but adding strictly here helps)
CREATE POLICY "Allow public select" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'products');