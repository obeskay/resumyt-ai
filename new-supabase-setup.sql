-- Drop existing tables and functions with CASCADE
DROP TABLE IF EXISTS transcriptions CASCADE;
DROP TABLE IF EXISTS summaries CASCADE; 
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS anonymous_users CASCADE;
DROP TABLE IF EXISTS pricing_plans CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;

-- Remove all existing auth users
DELETE FROM auth.users;

-- Create pricing_plans table
CREATE TABLE public.pricing_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quota INTEGER NOT NULL,
  features JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create anonymous_users table
CREATE TABLE public.anonymous_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT UNIQUE NOT NULL,
  transcriptions_used INTEGER DEFAULT 0,
  quota_remaining INTEGER DEFAULT 100,
  pricing_plan_id INTEGER REFERENCES pricing_plans(id) DEFAULT 1,
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
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for row-level security

-- Anyone can read pricing_plans table
CREATE POLICY "Anyone can read pricing plans"
ON pricing_plans
FOR SELECT
TO public
USING (true);

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
GRANT ALL ON public.pricing_plans TO anon;
GRANT ALL ON public.anonymous_users TO anon;
GRANT ALL ON public.videos TO anon;
GRANT ALL ON public.summaries TO anon;
GRANT ALL ON public.transcriptions TO anon;

-- Grant usage on sequences
GRANT USAGE, SELECT ON SEQUENCE pricing_plans_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE summaries_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE transcriptions_id_seq TO anon;

-- Insert default pricing plans
INSERT INTO public.pricing_plans (name, price, quota, features) VALUES
('Free', 0, 100, '{"feature1": "Basic summarization", "feature2": "Limited to 100 summaries per month"}'),
('Pro', 9.99, 500, '{"feature1": "Advanced summarization", "feature2": "Up to 500 summaries per month", "feature3": "Priority support"}'),
('Enterprise', 49.99, 5000, '{"feature1": "Premium summarization", "feature2": "Up to 5000 summaries per month", "feature3": "24/7 support", "feature4": "Custom integrations"}');
