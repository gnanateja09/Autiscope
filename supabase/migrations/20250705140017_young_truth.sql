/*
  # Create users and screening tables

  1. New Tables
    - profiles: User profile information linked to Supabase Auth
    - adult_screenings: Adult autism screening data
    - toddler_screenings: Toddler autism screening data

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Auto-create profiles when users register
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create adult_screenings table
CREATE TABLE IF NOT EXISTS adult_screenings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  age integer NOT NULL,
  responses jsonb NOT NULL DEFAULT '{}',
  classification_responses jsonb DEFAULT '{}',
  prediction text,
  classification_result text,
  chart_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create toddler_screenings table
CREATE TABLE IF NOT EXISTS toddler_screenings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  age_months integer NOT NULL,
  responses jsonb NOT NULL DEFAULT '{}',
  classification_responses jsonb DEFAULT '{}',
  prediction text,
  classification_result text,
  chart_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE adult_screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE toddler_screenings ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for adult_screenings
CREATE POLICY "Users can read own adult screenings"
  ON adult_screenings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own adult screenings"
  ON adult_screenings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own adult screenings"
  ON adult_screenings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for toddler_screenings
CREATE POLICY "Users can read own toddler screenings"
  ON toddler_screenings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own toddler screenings"
  ON toddler_screenings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own toddler screenings"
  ON toddler_screenings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;