-- Drop existing tables and functions
DROP TABLE IF EXISTS transcriptions;
DROP TABLE IF EXISTS summaries; 
DROP TABLE IF EXISTS videos;
DROP TABLE IF EXISTS users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user;

-- Create users table with role column
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT NOT NULL,
  usage_quota INTEGER,
  role TEXT NOT NULL DEFAULT 'anon',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create handle_new_user trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, ip_address, usage_quota, role)
  VALUES (NEW.id, NEW.raw_app_meta_data->>'ip_address', 1000, 'anon');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- Create other tables
CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES users (id)
);

CREATE TABLE summaries (
  id SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES videos (id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES users (id)
);

CREATE TABLE transcriptions (
  id SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES videos (id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES users (id)
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
USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can access their own summaries"
ON summaries
FOR ALL  
USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can access their own transcriptions"
ON transcriptions
FOR ALL
USING (auth.uid() = created_by);

-- Anonymous users can only read public data
CREATE POLICY "Anonymous users can read public data"
ON users
FOR SELECT
USING (role = 'anon');

CREATE POLICY "Anonymous users can read public videos" 
ON videos
FOR SELECT
USING (created_by IS NULL); 

CREATE POLICY "Anonymous users can read public summaries"
ON summaries
FOR SELECT
USING (created_by IS NULL);

CREATE POLICY "Anonymous users can read public transcriptions"
ON transcriptions  
FOR SELECT
USING (created_by IS NULL);

-- Grant necessary permissions
GRANT SELECT ON users TO AUTHENTICATED;
GRANT INSERT (ip_address, usage_quota, role) ON users TO ANON;

GRANT ALL ON videos TO AUTHENTICATED; 
GRANT SELECT ON videos TO ANON;

GRANT ALL ON summaries TO AUTHENTICATED;
GRANT SELECT ON summaries TO ANON; 

GRANT ALL ON transcriptions TO AUTHENTICATED;
GRANT SELECT ON transcriptions TO ANON;