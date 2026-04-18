-- USERS
-- Quickly find users by role (admin/member/user)
CREATE INDEX IF NOT EXISTS idx_users_permission_status
  ON users(permission_status);

-- USER PROFILES
-- Speeds up joins between users and user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id
  ON user_profiles(user_id);

-- MESSAGES
-- Optimizes topic feeds: filters by topic, ignores deleted messages, returns newest messages first
CREATE INDEX IF NOT EXISTS idx_messages_topic_created
  ON messages(topic_id, created_at DESC)
  WHERE is_deleted = false;

-- Speeds up lookups of messages by author
CREATE INDEX IF NOT EXISTS idx_messages_user_topic
  ON messages(user_id, topic_id, is_deleted);

-- In the future, if querying messages by parent_message_id
CREATE INDEX IF NOT EXISTS idx_messages_topic_parent
  ON messages(topic_id, parent_message_id, created_at DESC)
  WHERE is_deleted = false;

-- MESSAGE LIKES
-- Speeds up finding all likes for a specific message
CREATE INDEX IF NOT EXISTS idx_message_likes_message_id
  ON message_likes(message_id);

-- Speeds up finding all likes from a single user
CREATE INDEX IF NOT EXISTS idx_message_likes_user_id
  ON message_likes(user_id);

-- Prevent duplicate likes
CREATE UNIQUE INDEX IF NOT EXISTS unique_message_like
  ON message_likes(message_id, user_id);

-- Messages thread path index (optional)
CREATE INDEX IF NOT EXISTS idx_messages_topic_thread_path
  ON messages(topic_id, thread_path);

-- SESSIONS
-- Used on every authenticated request
CREATE INDEX IF NOT EXISTS idx_sessions_token
  ON sessions(session_token);

-- Speeds up joins from sessions → users
CREATE INDEX IF NOT EXISTS idx_sessions_user_id
  ON sessions(user_id);