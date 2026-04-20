-- App configurations (soft and hard deletes, and maintenance mode)
-- NOTE: Hard delete is counted from the time of soft delete, not from creation.
INSERT INTO app_config (key, value) VALUES
('message_soft_delete_days', '14'),
('message_hard_delete_days', '28'),
('session_hard_delete_days', '14'),
('signup_limit_window_minutes', '15'),
('signup_limit_max_users', '5'),
('login_limit_window_minutes', '5'),
('login_limit_max_users', '5'),
('max_message_chars', '700'),
('maintenance_mode', 'false'),
('admin_emoji', '🔑'),
('member_emoji', '⭐'),
('guest_emoji', '👤');


-- Seed default topics (safe to re-run)
INSERT INTO topics (slug, name, description, required_permission, sort_order)
VALUES
  ('announcements', 'Announcements', 'Important updates and notices', 'guest', 0),
  ('safety-alerts', 'Safety Alerts', 'Crime and suspicious activity', 'guest', 10),
  ('events', 'Events', 'Neighborhood meetings and activities', 'guest', 20),
  ('general', 'General Discussion', 'Neighborhood conversations', 'guest', 30),
  ('harrisburg', 'Harrisburg', 'All things city and governance', 'guest', 40),
  ('parking', 'Parking', 'Citywide and neighborhood parking', 'guest', 50),
  ('nuisances', 'Nuisances', 'Noise, vandalism, and irritations', 'guest', 60),
  ('help-requests', 'Help Requests', 'Ask neighbors for assistance', 'guest', 70),
  ('lost-found', 'Lost & Found', 'Lost and found for items or pets', 'guest', 80),
  ('buy-sell', 'Buy & Sell', 'Items for sale, or items wanted', 'guest', 90),
  ('free-stuff', 'Free Stuff', 'Get rid of your material burdens', 'guest', 100),
  ('businesses', 'Local Businesses', 'Recommend local services or restaurants', 'guest', 110),
  ('introductions', 'Introductions', 'Welcome new neighbors', 'guest', 120),
  ('feedback', 'Feedback', 'Suggestions to improve this site', 'guest', 130),
  ('members-only', 'Members Only', 'Messages are only visible to members', 'member', 140),
  ('admin-notes', 'Admin Notes', 'Boring admin stuff', 'admin', 150)
ON CONFLICT (slug) DO NOTHING;
