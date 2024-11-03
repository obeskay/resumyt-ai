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

-- Añadir una nueva columna a la tabla summaries para las preguntas sugeridas
ALTER TABLE summaries ADD COLUMN suggested_questions JSONB;

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

-- Actualizar la tabla de usuarios anónimos para incluir el plan y la cuota
ALTER TABLE anonymous_users 
ADD COLUMN plan_type VARCHAR(20) DEFAULT 'free' CHECK (plan_type IN ('free', 'basic', 'pro')),
ADD COLUMN quota_limit INTEGER DEFAULT 3,
ADD COLUMN quota_reset_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours');

-- Crear una nueva tabla para los planes de precios
CREATE TABLE pricing_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  quota_limit INTEGER NOT NULL,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear una función para resetear la cuota diariamente
CREATE OR REPLACE FUNCTION reset_daily_quota()
RETURNS void AS $$
BEGIN
  UPDATE anonymous_users
  SET quota_remaining = quota_limit,
      quota_reset_date = NOW() + INTERVAL '24 hours'
  WHERE quota_reset_date <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Crear un trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pricing_plans_updated_at
    BEFORE UPDATE ON pricing_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar planes de precios iniciales
INSERT INTO pricing_plans (name, description, price, quota_limit, features) VALUES
('Free', 'Perfect for casual users', 0, 3, '{"features": ["3 summaries per day", "Basic summary format", "Standard support"]}'),
('Basic', 'Great for regular users', 9.99, 30, '{"features": ["30 summaries per day", "All summary formats", "Priority support", "No ads"]}'),
('Pro', 'For power users', 19.99, 100, '{"features": ["100 summaries per day", "All summary formats", "Premium support", "No ads", "API access"]}');

-- Crear políticas de seguridad
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_users ENABLE ROW LEVEL SECURITY;

-- Políticas para pricing_plans
CREATE POLICY "Allow read access to pricing_plans for all"
ON pricing_plans FOR SELECT
TO public
USING (true);

-- Políticas para anonymous_users
CREATE POLICY "Allow users to read their own data"
ON anonymous_users FOR SELECT
TO public
USING (ip_address = current_setting('request.headers')::json->>'x-real-ip');

CREATE POLICY "Allow users to update their own data"
ON anonymous_users FOR UPDATE
TO public
USING (ip_address = current_setting('request.headers')::json->>'x-real-ip');

-- Función para decrementar la cuota
CREATE OR REPLACE FUNCTION decrement_quota(user_ip VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    current_quota INTEGER;
BEGIN
    -- Obtener la cuota actual
    SELECT quota_remaining INTO current_quota
    FROM anonymous_users
    WHERE ip_address = user_ip;

    -- Verificar si hay cuota disponible
    IF current_quota > 0 THEN
        -- Decrementar la cuota
        UPDATE anonymous_users
        SET quota_remaining = quota_remaining - 1
        WHERE ip_address = user_ip;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;
