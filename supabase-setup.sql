-- Primero eliminamos las tablas existentes si existen
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS summaries CASCADE;
DROP TABLE IF EXISTS videos CASCADE;
DROP TABLE IF EXISTS user_plan_history CASCADE;
DROP TABLE IF EXISTS pricing_plans CASCADE;
DROP TABLE IF EXISTS anonymous_users CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Ahora creamos la tabla users
CREATE TABLE users (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip_address text NOT NULL,
  email text,
  is_anonymous boolean DEFAULT true,
  transcriptions_used integer DEFAULT 0,
  quota_remaining integer,
  quota_limit integer,
  plan_type character DEFAULT 'F',
  pricing_plan_id integer,
  created_at timestamp DEFAULT now() NOT NULL,
  quota_reset_date timestamp DEFAULT now(),
  achievements jsonb DEFAULT '{"summaries": 0, "shares": 0, "streaks": 0}'::jsonb,
  preferences jsonb DEFAULT '{"theme": "system", "language": "en"}'::jsonb,
  UNIQUE(ip_address)
);

-- Resto de las tablas
CREATE TABLE videos (
  id VARCHAR(255) PRIMARY KEY,
  url text NOT NULL,
  title text,
  thumbnail_url text,
  created_at timestamp DEFAULT now() NOT NULL,
  user_id uuid REFERENCES users(id),
  share_count integer DEFAULT 0,
  is_public boolean DEFAULT false
);

CREATE TABLE summaries (
  id serial NOT NULL PRIMARY KEY,
  video_id VARCHAR(255) REFERENCES videos(id),
  title text,
  content text NOT NULL,
  highlights jsonb DEFAULT '[]'::jsonb,
  extended_summary text,
  transcript text NOT NULL,
  format text NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL,
  user_id uuid REFERENCES users(id),
  suggested_questions jsonb,
  share_url text UNIQUE,
  likes_count integer DEFAULT 0,
  UNIQUE(user_id, video_id)
);

CREATE TABLE achievements (
  id serial PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  requirement_count integer NOT NULL,
  reward_type text NOT NULL,
  reward_amount integer NOT NULL,
  icon_name text NOT NULL
);

CREATE TABLE user_achievements (
  user_id uuid REFERENCES users(id),
  achievement_id integer REFERENCES achievements(id),
  achieved_at timestamp DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

-- Insertar logros iniciales
INSERT INTO achievements (name, description, requirement_count, reward_type, reward_amount, icon_name) VALUES
('First Summary', 'Create your first video summary', 1, 'quota', 1, 'IconStar'),
('Summary Pro', 'Create 10 video summaries', 10, 'quota', 5, 'IconTrophy'),
('Sharing is Caring', 'Share 5 summaries', 5, 'quota', 3, 'IconShare'),
('Daily Streak', 'Use Resumyt for 7 consecutive days', 7, 'quota', 10, 'IconFlame');

-- Función para manejar logros
CREATE OR REPLACE FUNCTION check_achievement_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Lógica para verificar y otorgar logros
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para logros
CREATE TRIGGER after_summary_created
  AFTER INSERT ON summaries
  FOR EACH ROW
  EXECUTE FUNCTION check_achievement_progress();

-- Función para crear o recuperar usuario
DROP FUNCTION IF EXISTS get_or_create_anonymous_user(text, integer, character);
CREATE OR REPLACE FUNCTION get_or_create_anonymous_user(
    user_ip TEXT,
    initial_quota INTEGER,
    initial_plan CHARACTER
) RETURNS users AS $$
DECLARE
    existing_user users;
    new_user users;
BEGIN
    -- Iniciar una transacción explícita
    BEGIN
        -- Intentar obtener el usuario existente con un bloqueo exclusivo
        SELECT *
        INTO existing_user
        FROM users
        WHERE ip_address = user_ip
        FOR UPDATE NOWAIT;

        IF FOUND THEN
            -- Usuario encontrado, actualizar si es necesario
            IF existing_user.quota_remaining <= 0 AND existing_user.quota_reset_date <= NOW() THEN
                UPDATE users
                SET 
                    quota_remaining = initial_quota,
                    quota_reset_date = NOW() + INTERVAL '24 hours'
                WHERE id = existing_user.id
                RETURNING * INTO existing_user;
            END IF;
            
            RETURN existing_user;
        END IF;

        -- Si no existe, crear uno nuevo
        INSERT INTO users (
            ip_address,
            quota_remaining,
            quota_limit,
            plan_type,
            quota_reset_date,
            is_anonymous,
            achievements,
            preferences
        ) VALUES (
            user_ip,
            initial_quota,
            initial_quota,
            initial_plan,
            NOW() + INTERVAL '24 hours',
            true,
            '{"summaries": 0, "shares": 0, "streaks": 0}'::jsonb,
            '{"theme": "system", "language": "en"}'::jsonb
        )
        RETURNING * INTO new_user;

        RETURN new_user;

    EXCEPTION 
        WHEN lock_not_available THEN
            -- Si no podemos obtener el bloqueo, intentar obtener el usuario sin bloqueo
            SELECT * INTO existing_user
            FROM users
            WHERE ip_address = user_ip;
            
            IF FOUND THEN
                RETURN existing_user;
            END IF;
            
            -- Si aún no existe, esperar un momento y reintentar
            PERFORM pg_sleep(0.1);
            RETURN get_or_create_anonymous_user(user_ip, initial_quota, initial_plan);
            
        WHEN unique_violation THEN
            -- Si ocurre una violación de unicidad, intentar obtener el usuario existente
            SELECT * INTO existing_user
            FROM users
            WHERE ip_address = user_ip;
            
            IF FOUND THEN
                RETURN existing_user;
            ELSE
                -- En el caso improbable de que no podamos encontrar el usuario
                RAISE EXCEPTION 'Could not create or retrieve user for IP: %', user_ip;
            END IF;
    END;
END;
$$ LANGUAGE plpgsql;

-- Asegurarnos de que el índice existe
DROP INDEX IF EXISTS idx_users_ip_address;
CREATE UNIQUE INDEX idx_users_ip_address ON users(ip_address);

-- Actualizar las políticas RLS
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data"
ON users FOR SELECT
TO public
USING (
    ip_address = current_setting('request.headers')::json->>'x-real-ip'
    OR ip_address = '::1'
    OR is_anonymous = false
);

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
TO public
USING (
    ip_address = current_setting('request.headers')::json->>'x-real-ip'
    OR ip_address = '::1'
    OR is_anonymous = false
);

DROP POLICY IF EXISTS "Allow insert for new users" ON users;
CREATE POLICY "Allow insert for new users"
ON users FOR INSERT
TO public
WITH CHECK (true);
