/*
  # Ganeshotsav Scratch Card App Database Schema

  1. New Tables
    - `members`
      - `member_id` (uuid, primary key)
      - `name` (text)
      - `username` (text, unique)
      - `password` (text)
      - `is_admin` (boolean, default false)
      - `created_at` (timestamp)
    - `stickers`
      - `sticker_id` (text, primary key)
      - `name` (text)
      - `type` (text)
      - `probability` (numeric)
      - `availability` (integer)
      - `activation_date` (date)
    - `scratch_records`
      - `scratch_id` (uuid, primary key)
      - `member_id` (uuid, foreign key)
      - `sticker_id` (text, foreign key, nullable)
      - `date_scratched` (timestamp)
      - `is_paid_scratch` (boolean, default false)
      - `success` (boolean)
    - `member_collections`
      - `collection_id` (uuid, primary key)
      - `member_id` (uuid, foreign key)
      - `sticker_id` (text, foreign key)
      - `collected_at` (timestamp)
    - `donors`
      - `donor_id` (uuid, primary key)
      - `name` (text)
      - `amount` (numeric)
      - `date` (date)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add admin policies for management operations

  3. Sample Data
    - Insert default stickers (Ashtavinayak collection)
    - Insert demo users
    - Insert sample donors
*/

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  member_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  is_admin boolean DEFAULT false,
  paid_scratch_available boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create stickers table
CREATE TABLE IF NOT EXISTS stickers (
  sticker_id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('Common', 'Rare', 'Very Rare', 'Orion')),
  probability numeric NOT NULL CHECK (probability >= 0 AND probability <= 100),
  availability integer NOT NULL DEFAULT 0,
  activation_date date NOT NULL DEFAULT CURRENT_DATE
);

-- Create scratch records table
CREATE TABLE IF NOT EXISTS scratch_records (
  scratch_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
  sticker_id text REFERENCES stickers(sticker_id),
  date_scratched timestamptz DEFAULT now(),
  is_paid_scratch boolean DEFAULT false,
  success boolean NOT NULL
);

-- Create member collections table
CREATE TABLE IF NOT EXISTS member_collections (
  collection_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
  sticker_id text NOT NULL REFERENCES stickers(sticker_id),
  collected_at timestamptz DEFAULT now(),
  UNIQUE(member_id, sticker_id)
);

-- Create donors table
CREATE TABLE IF NOT EXISTS donors (
  donor_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  date date DEFAULT CURRENT_DATE
);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE scratch_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

-- Create policies for members
CREATE POLICY "Members can read own data"
  ON members
  FOR SELECT
  TO authenticated
  USING (member_id = (current_setting('app.current_member_id'))::uuid);

CREATE POLICY "Admins can read all members"
  ON members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE member_id = (current_setting('app.current_member_id'))::uuid 
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can update members"
  ON members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE member_id = (current_setting('app.current_member_id'))::uuid 
      AND is_admin = true
    )
  );

-- Create policies for stickers (public read)
CREATE POLICY "Anyone can read stickers"
  ON stickers
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for scratch records
CREATE POLICY "Members can read own scratch records"
  ON scratch_records
  FOR SELECT
  TO authenticated
  USING (member_id = (current_setting('app.current_member_id'))::uuid);

CREATE POLICY "Members can insert own scratch records"
  ON scratch_records
  FOR INSERT
  TO authenticated
  WITH CHECK (member_id = (current_setting('app.current_member_id'))::uuid);

CREATE POLICY "Admins can read all scratch records"
  ON scratch_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE member_id = (current_setting('app.current_member_id'))::uuid 
      AND is_admin = true
    )
  );

-- Create policies for member collections
CREATE POLICY "Members can read own collections"
  ON member_collections
  FOR SELECT
  TO authenticated
  USING (member_id = (current_setting('app.current_member_id'))::uuid);

CREATE POLICY "Members can insert own collections"
  ON member_collections
  FOR INSERT
  TO authenticated
  WITH CHECK (member_id = (current_setting('app.current_member_id'))::uuid);

CREATE POLICY "Admins can read all collections"
  ON member_collections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE member_id = (current_setting('app.current_member_id'))::uuid 
      AND is_admin = true
    )
  );

-- Create policies for donors (public read)
CREATE POLICY "Anyone can read donors"
  ON donors
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert default stickers
INSERT INTO stickers (sticker_id, name, type, probability, availability, activation_date) VALUES
  ('1', 'Mayureshwar', 'Common', 20, 100, '2024-08-01'),
  ('2', 'Siddhivinayak', 'Common', 20, 100, '2024-08-01'),
  ('3', 'Ballaleshwar', 'Common', 20, 100, '2024-08-01'),
  ('4', 'Varadavinayak', 'Rare', 7, 50, '2024-08-01'),
  ('5', 'Chintamani', 'Rare', 7, 50, '2024-08-01'),
  ('6', 'Girijatmaj', 'Very Rare', 3, 20, '2024-08-10'),
  ('7', 'Vighnahar', 'Very Rare', 2, 15, '2024-08-15'),
  ('8', 'Mahaganapati', 'Very Rare', 1, 10, '2024-08-18'),
  ('9', 'Orion Bappa', 'Orion', 0.5, 1, '2024-08-20')
ON CONFLICT (sticker_id) DO NOTHING;

-- Insert demo members
INSERT INTO members (name, username, password, is_admin) VALUES
  ('Arjun Patil', 'demo', 'demo', false),
  ('Admin User', 'admin', 'admin123', true),
  ('Priya Sharma', 'priya', 'priya123', false),
  ('Rajesh Kumar', 'rajesh', 'rajesh123', false),
  ('Sneha Desai', 'sneha', 'sneha123', false)
ON CONFLICT (username) DO NOTHING;

-- Insert sample donors
INSERT INTO donors (name, amount, date) VALUES
  ('Ramesh Patil', 25000, CURRENT_DATE),
  ('Suresh Industries', 15000, CURRENT_DATE),
  ('Priya Sharma', 10000, CURRENT_DATE),
  ('Ganesh Traders', 8000, CURRENT_DATE),
  ('Anjali Desai', 5000, CURRENT_DATE),
  ('Sai Industries', 3000, CURRENT_DATE)
ON CONFLICT DO NOTHING;