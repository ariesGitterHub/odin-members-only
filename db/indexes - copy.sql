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

-- Speeds up expiration cleanup jobs - No long needed, keep for reference
-- CREATE INDEX idx_messages_expires
--   ON messages(expires_at);

-- Speeds up lookups of messages by author
-- CREATE INDEX idx_messages_user_id
--   ON messages(user_id);
-- Below is useful if frequently querying messages by user (e.g., fetching all messages from a specific user). However, might want to ensure you are also filtering by other fields (such as topic_id or is_deleted) within queries. In such cases, a composite index could further improve performance...
CREATE INDEX idx_messages_user_topic
  ON messages(user_id, topic_id, is_deleted);

-- In the future, if querying messages by parent_message_id (especially when displaying threads)
CREATE INDEX idx_messages_topic_parent
ON messages(topic_id, parent_message_id, created_at DESC)
WHERE is_deleted = false;

 -- MESSAGE LIKES
-- Speeds up finding all likes for a specific message
CREATE INDEX idx_message_likes_message_id
  ON message_likes(message_id);

-- Speeds up finding all likes from a single user
CREATE INDEX idx_message_likes_user_id
  ON message_likes(user_id);

--This prevents duplicate likes and makes your toggle logic safe.
-- CREATE UNIQUE INDEX unique_message_like 
-- ON message_likes (message_id, user_id);
CREATE UNIQUE INDEX IF NOT EXISTS unique_message_like 
ON message_likes (message_id, user_id);

-- NOTE -  delete if I go back to flat reply threads
-- CREATE INDEX idx_messages_thread_path ON messages(thread_path);
-- a composite index may be more effective than a single-column index on thread_path alone.
CREATE INDEX idx_messages_topic_thread_path
ON messages(topic_id, thread_path);

-- SESSIONS
-- Used on every authenticated request
CREATE INDEX idx_sessions_token
  ON sessions(session_token);

-- Speeds up session expiration cleanup - No long needed, keep for reference
-- CREATE INDEX idx_sessions_expires
--   ON sessions(expires_at);

-- Speeds up joins from sessions → users
CREATE INDEX idx_sessions_user_id
  ON sessions(user_id);
