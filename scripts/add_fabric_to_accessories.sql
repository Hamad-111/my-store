-- Add fabric column to accessories_products table
ALTER TABLE accessories_products
ADD COLUMN IF NOT EXISTS fabric text;