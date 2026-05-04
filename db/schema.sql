-- ENUMS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_status_enum') THEN
    CREATE TYPE permission_status_enum AS ENUM ('guest', 'member', 'admin');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invite_decision_enum') THEN
    CREATE TYPE invite_decision_enum AS ENUM ('none', 'accepted', 'declined');
  END IF;
END
$$;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birthdate DATE,
  permission_status permission_status_enum NOT NULL DEFAULT 'guest',
  verified_by_admin BOOLEAN DEFAULT false,
  guest_upgrade_invite BOOLEAN DEFAULT false,
  invite_decision invite_decision_enum NOT NULL DEFAULT 'none',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- USER PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  avatar_type TEXT,
  avatar_color_fg TEXT,
  avatar_color_bg_top TEXT,
  avatar_color_bg_bottom TEXT,
  phone TEXT,
  street_address TEXT,
  apt_unit TEXT,
  city TEXT,
  us_state TEXT,
  zip_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APP CONFIG
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TOPICS
CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  required_permission permission_status_enum DEFAULT 'guest',
  is_active BOOLEAN DEFAULT true,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  parent_message_id INTEGER,
  thread_path TEXT,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_sticky BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- MESSAGE LIKES
CREATE TABLE IF NOT EXISTS message_likes (
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

-- LIKE COUNT TRIGGER
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE messages
    SET like_count = like_count + 1
    WHERE id = NEW.message_id;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE messages
    SET like_count = like_count - 1
    WHERE id = OLD.message_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;


DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_like_count') THEN
    CREATE TRIGGER trigger_like_count
    AFTER INSERT OR DELETE ON message_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_like_count();
  END IF;
END
$$;

-- REPLY COUNT TRIGGER (FIXED)
CREATE OR REPLACE FUNCTION update_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.parent_message_id IS NOT NULL THEN
      UPDATE messages
      SET reply_count = reply_count + 1
      WHERE id = NEW.parent_message_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.parent_message_id IS NOT NULL THEN
      UPDATE messages
      SET reply_count = reply_count - 1
      WHERE id = OLD.parent_message_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;


DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_reply_count') THEN
    CREATE TRIGGER trigger_reply_count
    AFTER INSERT OR DELETE ON messages
    FOR EACH ROW
    -- WHEN (NEW.parent_message_id IS NOT NULL OR OLD.parent_message_id IS NOT NULL)
    EXECUTE FUNCTION update_reply_count();
  END IF;
END
$$;

-- INDEXES (PRODUCTION PERFORMANCE)
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_topic_id ON messages(topic_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent_id ON messages(parent_message_id);

CREATE INDEX IF NOT EXISTS idx_message_likes_user_id ON message_likes(user_id);

-- SESSIONS TABLE (ONLY USE IF USING connect-pg-simple)
CREATE TABLE IF NOT EXISTS sessions (
  sid TEXT PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMPTZ NOT NULL
);

--CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);
CREATE INDEX idx_sessions_expire ON sessions(expire);