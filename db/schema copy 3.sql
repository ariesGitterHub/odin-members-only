-- Enum for user permission status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'permission_status_enum') THEN
    CREATE TYPE permission_status_enum AS ENUM ('guest', 'member', 'admin');
  END IF;
END
$$;

-- Enum for user member invites
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invite_decision_enum') THEN
    CREATE TYPE invite_decision_enum AS ENUM ('none', 'accepted', 'declined');
  END IF;
END
$$;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birthdate DATE,
  permission_status permission_status_enum  NOT NULL DEFAULT 'guest',
  verified_by_admin BOOLEAN DEFAULT false,
  guest_upgrade_invite BOOLEAN DEFAULT false,
  invite_decision invite_decision_enum NOT NULL DEFAULT 'none',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- User Profiles
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

-- App configurations for soft and hard deletes
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics 
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

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  parent_message_id INTEGER,
  -- NOTE below is the thread_path set up for ordering reply messages - delete if I return to flat reply threads
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
  -- NOTE - using cron jobs now
  -- expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days', -- default expires_at
  is_sticky BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- Message Likes
CREATE TABLE IF NOT EXISTS message_likes (
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

-- Trigger function to update like_count
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

-- Trigger on message_likes table
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

-- Trigger function to update reply_count
CREATE OR REPLACE FUNCTION update_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE messages
    SET reply_count = reply_count + 1
    WHERE id = NEW.message_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE messages
    SET reply_count = reply_count - 1
    WHERE id = OLD.message_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

