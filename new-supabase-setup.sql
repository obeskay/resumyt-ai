-- Drop existing tables and functions
DROP TABLE IF EXISTS transcriptions;
DROP TABLE IF EXISTS summaries; 
DROP TABLE IF EXISTS videos;
DROP TABLE IF EXISTS users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user;

-- Create users table with role column
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  ip_address TEXT,
  usage_quota INTEGER DEFAULT 1000,
  role TEXT NOT NULL DEFAULT 'anon',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, ip_address, role)
  VALUES (NEW.id, NEW.raw_app_meta_data->>'ip_address', 'anon');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Create other tables
CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL
);

CREATE TABLE summaries (
  id SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES videos (id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL
);

CREATE TABLE transcriptions (
  id SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES videos (id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Create policies for row-level security
-- Authenticated users can access their own data
CREATE POLICY "Authenticated users can access their own data" 
ON users
FOR ALL
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access their own videos"
ON videos 
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can access their own summaries"
ON summaries
FOR ALL  
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can access their own transcriptions"
ON transcriptions
FOR ALL
USING (auth.uid() = user_id);

-- Anonymous users can only read public data
CREATE POLICY "Anonymous users can read public data"
ON users
FOR SELECT
USING (role = 'anon');

CREATE POLICY "Anonymous users can read public videos" 
ON videos
FOR SELECT
USING (user_id IS NULL); 

CREATE POLICY "Anonymous users can read public summaries"
ON summaries
FOR SELECT
USING (user_id IS NULL);

CREATE POLICY "Anonymous users can read public transcriptions"
ON transcriptions  
FOR SELECT
USING (user_id IS NULL);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcriptions ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT ON public.users TO authenticated;
GRANT INSERT, UPDATE ON public.users TO authenticated;

GRANT ALL ON public.videos TO authenticated;
GRANT SELECT ON public.videos TO anon;

-- Add RLS policy for videos table
CREATE POLICY "Users can insert their own videos" ON public.videos
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);


GRANT ALL ON public.summaries TO authenticated;
GRANT SELECT ON public.summaries TO anon;

GRANT ALL ON public.transcriptions TO authenticated;
GRANT SELECT ON public.transcriptions TO anon;
