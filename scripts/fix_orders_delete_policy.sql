-- POLICY: Enable delete for authenticated users on 'orders' table
-- Run this in your Supabase SQL Editor if you are getting "Failed to delete" errors.
BEGIN;
-- 1. Enable RLS (if not already enabled)
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;
-- 2. Create Policy to allow DELETE
-- Note: Adjust 'to authenticated' if you have specific roles like 'admin'
CREATE POLICY "Enable delete for authenticated users" ON "public"."orders" FOR DELETE TO authenticated USING (true);
-- Or add checks like: USING (auth.uid() = user_id)
COMMIT;