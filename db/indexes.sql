-- USERS
-- Used to quickly find users by role (admin/member/user)
CREATE INDEX idx_users_permission_status
  ON users(permission_status);

-- USER PROFILES
-- Speeds up joins between users and user_profiles
CREATE INDEX idx_user_profiles_user_id
  ON user_profiles(user_id);

-- MESSAGES
-- Optimizes topic feeds:
--   - filters by topic
--   - ignores deleted messages
--   - returns newest messages first
CREATE INDEX idx_messages_topic_created
  ON messages(topic_id, created_at DESC)
  WHERE is_deleted = false;

-- Speeds up expiration cleanup jobs
CREATE INDEX idx_messages_expires
  ON messages(expires_at);

-- Speeds up lookups of messages by author
CREATE INDEX idx_messages_user_id
  ON messages(user_id);

-- SESSIONS
-- Used on every authenticated request
CREATE INDEX idx_sessions_token
  ON sessions(session_token);

-- Speeds up session expiration cleanup
CREATE INDEX idx_sessions_expires
  ON sessions(expires_at);

-- Speeds up joins from sessions → users
CREATE INDEX idx_sessions_user_id
  ON sessions(user_id);
