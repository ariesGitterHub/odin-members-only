-- =========================
-- USERS
-- =========================
CREATE INDEX IF NOT EXISTS idx_users_permission_status
  ON users(permission_status);


-- =========================
-- USER PROFILES
-- =========================
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id
  ON user_profiles(user_id);


-- =========================
-- MESSAGES
-- =========================

-- Feed queries (topic timeline)
CREATE INDEX IF NOT EXISTS idx_messages_topic_created
  ON messages(topic_id, created_at DESC)
  WHERE is_deleted = false;

-- Replies / thread navigation
CREATE INDEX IF NOT EXISTS idx_messages_topic_parent
  ON messages(topic_id, parent_message_id, created_at DESC)
  WHERE is_deleted = false;

-- User activity lookup
CREATE INDEX IF NOT EXISTS idx_messages_user_topic
  ON messages(user_id, topic_id);

-- Direct reply lookup (IMPORTANT)
CREATE INDEX IF NOT EXISTS idx_messages_parent_message_id
  ON messages(parent_message_id)
  WHERE parent_message_id IS NOT NULL;


-- =========================
-- MESSAGE LIKES
-- =========================

CREATE INDEX IF NOT EXISTS idx_message_likes_message_id
  ON message_likes(message_id);

CREATE INDEX IF NOT EXISTS idx_message_likes_user_id
  ON message_likes(user_id);

-- Prevent duplicate likes
CREATE UNIQUE INDEX IF NOT EXISTS unique_message_like
  ON message_likes(message_id, user_id);


-- =========================
-- THREADING
-- =========================
CREATE INDEX IF NOT EXISTS idx_messages_topic_thread_path
  ON messages(topic_id, thread_path);


-- =========================
-- SESSIONS (connect-pg-simple)
-- =========================
CREATE INDEX IF NOT EXISTS idx_sessions_expire
  ON sessions(expire);