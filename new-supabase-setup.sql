-- Drop existing tables and functions with CASCADE
DROP TABLE IF EXISTS transcriptions CASCADE;
DROP TABLE IF EXISTS summaries CASCADE; 
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS anonymous_users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;

-- Remove all existing auth users
DELETE FROM auth.users;

-- Create anonymous_users table
CREATE TABLE public.anonymous_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT UNIQUE NOT NULL,
  transcriptions_used INTEGER DEFAULT 0,
  quota_remaining INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create videos table
CREATE TABLE videos (
  id VARCHAR(255) PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES anonymous_users(id) NOT NULL
);

-- Create summaries table
CREATE TABLE summaries (
  id SERIAL PRIMARY KEY,
  video_id VARCHAR(255) REFERENCES videos (id),
  content TEXT NOT NULL,
  transcript TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES anonymous_users(id) NOT NULL,
  UNIQUE(user_id, video_id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_summaries_user_id ON summaries(user_id);
CREATE INDEX idx_summaries_video_id ON summaries(video_id);

-- Create transcriptions table
CREATE TABLE transcriptions (
  id SERIAL PRIMARY KEY,
  video_id VARCHAR(255) REFERENCES videos (id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES anonymous_users(id) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.anonymous_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for row-level security

-- Anyone can insert into anonymous_users table
CREATE POLICY "Anyone can insert anonymous users"
ON anonymous_users
FOR INSERT
TO public
WITH CHECK (true);

-- Anyone can read anonymous_users table
CREATE POLICY "Anyone can read anonymous users"
ON anonymous_users
FOR SELECT
TO public
USING (true);

-- Anyone can update anonymous_users table
CREATE POLICY "Anyone can update anonymous users"
ON anonymous_users
FOR UPDATE
TO public
USING (true);

-- Anyone can access videos
CREATE POLICY "Anyone can access videos"
ON videos 
FOR ALL
TO public
USING (true);

-- Anyone can access summaries
CREATE POLICY "Anyone can access summaries"
ON summaries
FOR ALL
TO public
USING (true);

-- Anyone can access transcriptions
CREATE POLICY "Anyone can access transcriptions"
ON transcriptions
FOR ALL
TO public
USING (true);

-- Grant necessary permissions
GRANT ALL ON public.anonymous_users TO anon;
GRANT ALL ON public.videos TO anon;
GRANT ALL ON public.summaries TO anon;
GRANT ALL ON public.transcriptions TO anon;

-- Grant usage on sequences
GRANT USAGE, SELECT ON SEQUENCE summaries_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE transcriptions_id_seq TO anon;
