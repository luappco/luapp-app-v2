-- ============================================================
-- LUAPP — Migración completa de base de datos
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- 1. AMPLIAR TABLA usuarios
-- ============================================================

ALTER TABLE usuarios
  -- Físico
  ADD COLUMN IF NOT EXISTS talla           text,
  ADD COLUMN IF NOT EXISTS silueta         text,
  ADD COLUMN IF NOT EXISTS ojos            text,
  ADD COLUMN IF NOT EXISTS cabello         text,
  ADD COLUMN IF NOT EXISTS largo_cabello   text,
  ADD COLUMN IF NOT EXISTS fumador         boolean DEFAULT false,

  -- Personal
  ADD COLUMN IF NOT EXISTS pais            text DEFAULT 'Colombia',
  ADD COLUMN IF NOT EXISTS region          text,
  ADD COLUMN IF NOT EXISTS orientacion_sexual text DEFAULT 'Heterosexual',
  ADD COLUMN IF NOT EXISTS hijos           text DEFAULT 'No',
  ADD COLUMN IF NOT EXISTS profesion       text,
  ADD COLUMN IF NOT EXISTS ingresos        text,
  ADD COLUMN IF NOT EXISTS signo_zodiacal  text,
  ADD COLUMN IF NOT EXISTS etnia           text,

  -- Relación
  ADD COLUMN IF NOT EXISTS relacion_buscada text[],
  ADD COLUMN IF NOT EXISTS personalidad     text[],

  -- Actividad
  ADD COLUMN IF NOT EXISTS ultimo_acceso   timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at      timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS verificado      boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium         boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS destacado       boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS idiomas         text[],
  ADD COLUMN IF NOT EXISTS deportes        text[],
  ADD COLUMN IF NOT EXISTS actividades     text[];

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_usuarios_genero       ON usuarios(genero);
CREATE INDEX IF NOT EXISTS idx_usuarios_ciudad       ON usuarios(ciudad);
CREATE INDEX IF NOT EXISTS idx_usuarios_edad         ON usuarios(edad);
CREATE INDEX IF NOT EXISTS idx_usuarios_ultimo_acceso ON usuarios(ultimo_acceso DESC);
CREATE INDEX IF NOT EXISTS idx_usuarios_created_at   ON usuarios(created_at DESC);

-- ============================================================
-- 2. TABLA visitantes
-- ============================================================

CREATE TABLE IF NOT EXISTS visitantes (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  visitado_id  uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  visitante_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(visitado_id, visitante_id)
);

CREATE INDEX IF NOT EXISTS idx_visitantes_visitado  ON visitantes(visitado_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitantes_visitante ON visitantes(visitante_id);

ALTER TABLE visitantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "visitantes_insert_own" ON visitantes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = visitante_id);

CREATE POLICY IF NOT EXISTS "visitantes_select_own" ON visitantes
  FOR SELECT TO authenticated USING (auth.uid() = visitado_id OR auth.uid() = visitante_id);

-- ============================================================
-- 3. TABLA favoritos
-- ============================================================

CREATE TABLE IF NOT EXISTS favoritos (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id   uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  favorito_id  uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(usuario_id, favorito_id)
);

CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos(usuario_id);

ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "favoritos_own" ON favoritos
  FOR ALL TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

-- ============================================================
-- 4. TABLA reportes
-- ============================================================

CREATE TABLE IF NOT EXISTS reportes (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reportado_id  uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  reportador_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  motivo        text NOT NULL,
  descripcion   text,
  estado        text DEFAULT 'pendiente',
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "reportes_insert_own" ON reportes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reportador_id);

-- ============================================================
-- 5. TABLA bloqueos
-- ============================================================

CREATE TABLE IF NOT EXISTS bloqueos (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bloqueador_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  bloqueado_id  uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at    timestamptz DEFAULT now(),
  UNIQUE(bloqueador_id, bloqueado_id)
);

ALTER TABLE bloqueos ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "bloqueos_own" ON bloqueos
  FOR ALL TO authenticated USING (auth.uid() = bloqueador_id) WITH CHECK (auth.uid() = bloqueador_id);

-- ============================================================
-- 6. TABLA notificaciones
-- ============================================================

CREATE TABLE IF NOT EXISTS notificaciones (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id  uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo        text NOT NULL,   -- 'flechazo', 'match', 'mensaje', 'visita', 'favorito'
  de_usuario_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  leida       boolean DEFAULT false,
  data        jsonb,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id, leida, created_at DESC);

ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "notificaciones_own" ON notificaciones
  FOR ALL TO authenticated USING (auth.uid() = usuario_id);

-- ============================================================
-- 7. TABLA regalos_virtuales
-- ============================================================

CREATE TABLE IF NOT EXISTS regalos_virtuales (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  de_usuario   uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  a_usuario    uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo         text NOT NULL,   -- 'rosa', 'copa', 'corazon', etc.
  mensaje      text,
  costo        int DEFAULT 5,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE regalos_virtuales ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "regalos_insert" ON regalos_virtuales
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = de_usuario);

CREATE POLICY IF NOT EXISTS "regalos_select" ON regalos_virtuales
  FOR SELECT TO authenticated USING (auth.uid() = de_usuario OR auth.uid() = a_usuario);

-- ============================================================
-- 8. AMPLIAR TABLA matches
-- ============================================================

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS created_at    timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS activo        boolean DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_matches_usuarios ON matches(usuario1, usuario2);

-- ============================================================
-- 9. AMPLIAR TABLA mensajes
-- ============================================================

ALTER TABLE mensajes
  ADD COLUMN IF NOT EXISTS leido         boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS tipo          text DEFAULT 'texto',  -- 'texto', 'imagen', 'regalo'
  ADD COLUMN IF NOT EXISTS match_id      uuid REFERENCES matches(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion ON mensajes(de, a, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_match ON mensajes(match_id);

-- ============================================================
-- 10. AMPLIAR TABLA flechazos
-- ============================================================

ALTER TABLE flechazos
  ADD COLUMN IF NOT EXISTS created_at   timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS activo       boolean DEFAULT true;

-- ============================================================
-- 11. AMPLIAR TABLA transacciones
-- ============================================================

ALTER TABLE transacciones
  ADD COLUMN IF NOT EXISTS created_at   timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS estado       text DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS proveedor    text DEFAULT 'mercadopago',
  ADD COLUMN IF NOT EXISTS metadata     jsonb;

-- ============================================================
-- 12. FUNCIÓN: actualizar ultimo_acceso automáticamente
-- ============================================================

CREATE OR REPLACE FUNCTION actualizar_ultimo_acceso()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE usuarios
  SET ultimo_acceso = now()
  WHERE id = auth.uid();
END;
$$;

-- ============================================================
-- 13. FUNCIÓN: registrar visita
-- ============================================================

CREATE OR REPLACE FUNCTION registrar_visita(perfil_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF auth.uid() = perfil_id THEN RETURN; END IF;

  INSERT INTO visitantes (visitado_id, visitante_id)
  VALUES (perfil_id, auth.uid())
  ON CONFLICT (visitado_id, visitante_id) DO UPDATE
    SET created_at = now();

  INSERT INTO notificaciones (usuario_id, tipo, de_usuario_id)
  VALUES (perfil_id, 'visita', auth.uid())
  ON CONFLICT DO NOTHING;
END;
$$;

-- ============================================================
-- 14. FUNCIÓN: crear notificación de flechazo
-- ============================================================

CREATE OR REPLACE FUNCTION notificar_flechazo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO notificaciones (usuario_id, tipo, de_usuario_id)
  VALUES (NEW.a_usuario, 'flechazo', NEW.de_usuario);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notificar_flechazo ON flechazos;
CREATE TRIGGER trigger_notificar_flechazo
  AFTER INSERT ON flechazos
  FOR EACH ROW EXECUTE FUNCTION notificar_flechazo();

-- ============================================================
-- 15. FUNCIÓN: crear notificación de match
-- ============================================================

CREATE OR REPLACE FUNCTION notificar_match()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO notificaciones (usuario_id, tipo, de_usuario_id)
  VALUES (NEW.usuario1, 'match', NEW.usuario2);

  INSERT INTO notificaciones (usuario_id, tipo, de_usuario_id)
  VALUES (NEW.usuario2, 'match', NEW.usuario1);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notificar_match ON matches;
CREATE TRIGGER trigger_notificar_match
  AFTER INSERT ON matches
  FOR EACH ROW EXECUTE FUNCTION notificar_match();

-- ============================================================
-- FIN DE MIGRACIÓN
-- ============================================================
