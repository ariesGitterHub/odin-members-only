-- Create default admin user (safe to re-run)

INSERT INTO users (
  email,
  password_hash,
  first_name,
  last_name,
  permission_status
)
VALUES (
  'admin@can.org',
  '$2b$12$REPLACE_WITH_BCRYPT_HASH',
  'CAN',
  'Admin',
  'admin'
)
ON CONFLICT (email) DO NOTHING;

-- Ensure admin has a profile and is verified

INSERT INTO user_profiles (user_id, verified_by_admin)
SELECT u.id, true
FROM users u
LEFT JOIN user_profiles p ON p.user_id = u.id
WHERE u.email = 'admin@can.org'
  AND p.user_id IS NULL;

-- Seed default topics (safe to re-run)

INSERT INTO topics (slug, name, description, sort_order)
VALUES
  ('announcements', 'Announcements', 'Official updates and important notices', 0),
  ('safety-alerts', 'Safety Alerts', 'Suspicious activity and safety notices', 10),
  ('events', 'Events', 'Neighborhood events and activities', 20),
  ('general', 'General Discussion', 'General neighborhood conversations', 30),
  ('help-requests', 'Help Requests', 'Ask neighbors for help or assistance', 40),
  ('lost-found', 'Lost & Found', 'Lost or found pets and items', 50),
  ('buy-sell', 'Buy & Sell', 'Items for sale or wanted', 60),
  ('free-stuff', 'Free Stuff', 'Give away items you no longer need', 70),
  ('businesses', 'Local Businesses/Services', 'Recommendations and offers for local services', 80),
  ('introductions', 'Introductions', 'Welcome new neighbors', 90),
  ('feedback', 'Feedback', 'Suggestions and feedback about this board', 100)
ON CONFLICT (slug) DO NOTHING;
