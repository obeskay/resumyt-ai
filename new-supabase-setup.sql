-- Eliminar tablas existentes si existen
DROP TABLE IF EXISTS transcriptions CASCADE;
DROP TABLE IF EXISTS summaries CASCADE; 
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS anonymous_users CASCADE;
DROP TABLE IF EXISTS pricing_plans CASCADE;

-- Eliminar trigger y función si existen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user CASCADE;

-- Intentar eliminar usuarios de auth solo si la tabla existe
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
    DELETE FROM auth.users;
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'Tabla auth.users no existe, continuando...';
END $$;

-- Crear tabla pricing_plans
CREATE TABLE public.pricing_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quota INTEGER NOT NULL,
  features JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla anonymous_users
CREATE TABLE public.anonymous_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT UNIQUE NOT NULL,
  transcriptions_used INTEGER DEFAULT 0,
  quota_remaining INTEGER DEFAULT 100,
  pricing_plan_id INTEGER REFERENCES pricing_plans(id) DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Modificar la tabla videos para incluir el título
CREATE TABLE videos (
  id VARCHAR(255) PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES anonymous_users(id) NOT NULL
);

-- Crear tabla summaries
CREATE TABLE summaries (
  id SERIAL PRIMARY KEY,
  video_id VARCHAR(255) REFERENCES videos (id),
  title TEXT,
  content TEXT NOT NULL,
  transcript TEXT NOT NULL,
  format TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES anonymous_users(id) NOT NULL,
  UNIQUE(user_id, video_id)
);

-- Crear índices para búsquedas más rápidas
CREATE INDEX idx_summaries_user_id ON summaries(user_id);
CREATE INDEX idx_summaries_video_id ON summaries(video_id);

-- Habilitar Row Level Security
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

-- Crear políticas para row-level security

-- Cualquiera puede leer la tabla pricing_plans
CREATE POLICY "Cualquiera puede leer pricing plans"
ON pricing_plans FOR SELECT TO public USING (true);

-- Cualquiera puede insertar en la tabla anonymous_users
CREATE POLICY "Cualquiera puede insertar anonymous users"
ON anonymous_users FOR INSERT TO public WITH CHECK (true);

-- Cualquiera puede leer la tabla anonymous_users
CREATE POLICY "Cualquiera puede leer anonymous users"
ON anonymous_users FOR SELECT TO public USING (true);

-- Cualquiera puede actualizar la tabla anonymous_users
CREATE POLICY "Cualquiera puede actualizar anonymous users"
ON anonymous_users FOR UPDATE TO public USING (true);

-- Cualquiera puede acceder a videos
CREATE POLICY "Cualquiera puede acceder a videos"
ON videos FOR ALL TO public USING (true);

-- Cualquiera puede acceder a summaries
CREATE POLICY "Cualquiera puede acceder a summaries"
ON summaries FOR ALL TO public USING (true);

-- Otorgar permisos necesarios
GRANT ALL ON public.pricing_plans TO anon;
GRANT ALL ON public.anonymous_users TO anon;
GRANT ALL ON public.videos TO anon;
GRANT ALL ON public.summaries TO anon;

-- Otorgar uso en secuencias
GRANT USAGE, SELECT ON SEQUENCE pricing_plans_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE summaries_id_seq TO anon;

-- Insertar planes de precios predeterminados
INSERT INTO public.pricing_plans (name, price, quota, features) VALUES
('Free', 0, 100, '{"feature1": "Resumen básico", "feature2": "Limitado a 100 resúmenes por mes"}'),
('Pro', 9.99, 500, '{"feature1": "Resumen avanzado", "feature2": "Hasta 500 resúmenes por mes", "feature3": "Soporte prioritario"}'),
('Enterprise', 49.99, 5000, '{"feature1": "Resumen premium", "feature2": "Hasta 5000 resúmenes por mes", "feature3": "Soporte 24/7", "feature4": "Integraciones personalizadas"}');
