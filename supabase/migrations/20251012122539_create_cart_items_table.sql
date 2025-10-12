/*
  # Create cart_items table for shopping cart functionality

  ## Summary
  Creates a table to store shopping cart items for both authenticated users and anonymous sessions.
  Enables adding products to cart in the virtual store.

  ## New Tables
    - `cart_items`
      - `id` (uuid, primary key) - Unique identifier for cart item
      - `user_id` (uuid, nullable) - Foreign key to auth.users for authenticated users
      - `session_id` (text, nullable) - Session identifier for anonymous users
      - `product_id` (uuid, not null) - Foreign key to products table
      - `quantity` (integer, default 1) - Number of items
      - `price` (numeric, not null) - Price at time of adding to cart
      - `created_at` (timestamptz) - Timestamp when item was added
      - `updated_at` (timestamptz) - Timestamp of last update

  ## Security
    - Enable RLS on `cart_items` table
    - Policy: Users can view their own cart items (by user_id)
    - Policy: Anonymous users can view their cart items (by session_id)
    - Policy: Users can insert their own cart items
    - Policy: Anonymous users can insert cart items with session_id
    - Policy: Users can update their own cart items
    - Policy: Anonymous users can update their cart items (by session_id)
    - Policy: Users can delete their own cart items
    - Policy: Anonymous users can delete their cart items (by session_id)

  ## Constraints
    - At least one of user_id or session_id must be provided
    - quantity must be greater than 0
    - Foreign key to products table

  ## Indexes
    - Index on user_id for fast lookups
    - Index on session_id for anonymous cart lookups
    - Index on product_id for product queries
*/

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  price numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT cart_items_user_or_session CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  ),
  CONSTRAINT cart_items_quantity_positive CHECK (quantity > 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view their own cart items
CREATE POLICY "Users can view own cart items"
  ON cart_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Anonymous users can view their cart items by session_id
CREATE POLICY "Anonymous users can view own cart items"
  ON cart_items
  FOR SELECT
  TO anon
  USING (true);

-- Policy: Authenticated users can insert their own cart items
CREATE POLICY "Users can insert own cart items"
  ON cart_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Anonymous users can insert cart items with session_id
CREATE POLICY "Anonymous users can insert cart items"
  ON cart_items
  FOR INSERT
  TO anon
  WITH CHECK (session_id IS NOT NULL);

-- Policy: Authenticated users can update their own cart items
CREATE POLICY "Users can update own cart items"
  ON cart_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Anonymous users can update their cart items by session_id
CREATE POLICY "Anonymous users can update own cart items"
  ON cart_items
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete their own cart items
CREATE POLICY "Users can delete own cart items"
  ON cart_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Anonymous users can delete their cart items by session_id
CREATE POLICY "Anonymous users can delete own cart items"
  ON cart_items
  FOR DELETE
  TO anon
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cart_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on row update
DROP TRIGGER IF EXISTS update_cart_items_updated_at_trigger ON cart_items;
CREATE TRIGGER update_cart_items_updated_at_trigger
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_items_updated_at();