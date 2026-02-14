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
  ('safety-alerts', 'Safety Alerts', 'Suspicious activity and crime', 10),
  ('events', 'Events', 'Neighborhood events, meetings, and activities', 20),
  ('general', 'General Discussion', 'General neighborhood conversations', 30),
  ('nuisances', 'Nuisances', 'Noise, vandalism, and general irritations', 40),
  ('help-requests', 'Help Requests', 'Ask neighbors for help or assistance', 50),
  ('lost-found', 'Lost & Found', 'Lost or found pets and items', 60),
  ('buy-sell', 'Buy & Sell', 'Items for sale or wanted', 70),
  ('free-stuff', 'Free Stuff', 'Give away items you no longer need or want', 80),
  ('businesses', 'Local Businesses', 'Recommendations and offers for local services', 90),
  ('introductions', 'Introductions', 'Welcome new neighbors', 100),
  ('feedback', 'Feedback', 'Suggestions and feedback about this site', 110)
ON CONFLICT (slug) DO NOTHING;


-- TEST DUMMY DATA
-- =====================================================
-- DUMMY USERS (Development Only)
-- =====================================================

INSERT INTO users (
  email,
  password_hash,
  first_name,
  last_name,
  birthdate,
  permission_status
)
VALUES
  ('alan@can.local',  '$2b$12$DUMMY_HASH', 'Alan',  'Rivera', '1961-01-05', 'user'),
  ('bruce@can.local', '$2b$12$DUMMY_HASH', 'Bruce', 'Chen', '1951-04-05', 'user'),
  ('chuck@can.local', '$2b$12$DUMMY_HASH', 'Chuck', 'Thompson', '1941-08-05', 'member'),
  ('dave@can.local',  '$2b$12$DUMMY_HASH', 'Dave',  'Brooks', '1951-10-05', 'member')
ON CONFLICT (email) DO NOTHING;


-- =====================================================
-- USER PROFILES
-- =====================================================

-- INSERT INTO user_profiles (user_id, verified_by_admin)
-- SELECT u.id, true
-- FROM users u
-- LEFT JOIN user_profiles p ON p.user_id = u.id
-- WHERE u.email IN (
--   'alan@can.local',
--   'bruce@can.local',
--   'chuck@can.local',
--   'dave@can.local'
-- )
-- AND p.user_id IS NULL;

INSERT INTO user_profiles (
  user_id,
  avatar_type,
  avatar_color_fg,
  avatar_color_bg_top,
  avatar_color_bg_bottom,
  phone,
  street_address,
  city,
  us_state,
  zip_code,
  verified_by_admin
)
SELECT
  u.id,
  v.avatar_type,
  v.avatar_color_fg,
  v.avatar_color_bg_top,
  v.avatar_color_bg_bottom,
  v.phone,
  v.street_address,
  v.city,
  v.us_state,
  v.zip_code,
  true
FROM users u

LEFT JOIN (
  VALUES
    ('chuck@can.local', '🦍', '', '#92cfe4', '#7de9e9',  '555-111-2222', '123 Maple St', 'Harrisburg', 'PA', '17102'),
    ('dave@can.local', '🐅', '#521313', '#eeee7d', '#83741d', '555-333-4444', '456 Oak Ave',  'Harrisburg',   'PA', '17101')
) AS v(email, avatar_type, avatar_color_fg, avatar_color_bg_top, avatar_color_bg_bottom, phone, street_address, city, us_state, zip_code)
ON u.email = v.email

LEFT JOIN user_profiles p ON p.user_id = u.id

WHERE u.email IN (
  'alan@can.local',
  'bruce@can.local',
  'chuck@can.local',
  'dave@can.local'
)
AND p.user_id IS NULL;



-- =====================================================
-- DUMMY MESSAGES
-- =====================================================


-- 1️⃣ Introductions
INSERT INTO messages (topic_id, user_id, title, like_count, body, expires_at)
SELECT t.id, u.id,
  'Hello from Alan', 7,
  'Hi everyone, just moved to the neighborhood last week. Looking forward to meeting you all!',
  NOW() + INTERVAL '30 days'
FROM topics t, users u
WHERE t.slug = 'introductions'
  AND u.email = 'alan@can.local'
LIMIT 1;


-- 2️⃣ Safety Alert
INSERT INTO messages (topic_id, user_id, title, like_count, body, expires_at)
SELECT t.id, u.id,
  'Car break-ins reported on Maple St.', 9,
  'Just a heads up — two cars were broken into overnight near Maple and 3rd. Please remember to lock your vehicles.',
  NOW() + INTERVAL '14 days'
FROM topics t, users u
WHERE t.slug = 'safety-alerts'
  AND u.email = 'bruce@can.local'
LIMIT 1;


-- 3️⃣ Buy & Sell
INSERT INTO messages (topic_id, user_id, title, like_count, body, expires_at)
SELECT t.id, u.id,
  'Bike for sale - $75',  1,
  'Selling a lightly used mountain bike. 26-inch wheels, great condition. DM if interested.',
  NOW() + INTERVAL '30 days'
FROM topics t, users u
WHERE t.slug = 'buy-sell'
  AND u.email = 'chuck@can.local'
LIMIT 1;


-- 4️⃣ Free Stuff
INSERT INTO messages (topic_id, user_id, title, like_count, body, expires_at)
SELECT t.id, u.id, 
  'Free moving boxes', 2,
  'Just finished moving — have about 20 boxes in good shape. Free for pickup.',
  NOW() + INTERVAL '10 days'
FROM topics t, users u
WHERE t.slug = 'free-stuff'
  AND u.email = 'dave@can.local'
LIMIT 1;


-- 5️⃣ Help Request
INSERT INTO messages (topic_id, user_id, title, like_count, body, expires_at)
SELECT t.id, u.id, 
  'Need recommendation for plumber', 0,
  'Can anyone recommend a reliable plumber for a small kitchen leak?',
  NOW() + INTERVAL '15 days'
FROM topics t, users u
WHERE t.slug = 'help-requests'
  AND u.email = 'alan@can.local'
LIMIT 1;


-- 6️⃣ Event
INSERT INTO messages (topic_id, user_id, title, like_count, body, expires_at)
SELECT t.id, u.id,
  'Neighborhood BBQ this Saturday', 20,
  'Planning a casual BBQ at Riverside Park at 4pm. Bring something to share!',
  NOW() + INTERVAL '7 days'
FROM topics t, users u
WHERE t.slug = 'events'
  AND u.email = 'bruce@can.local'
LIMIT 1;


-- 7️⃣ Lost & Found
INSERT INTO messages (topic_id, user_id, title, like_count, body, expires_at)
SELECT t.id, u.id, 
  'Found: small brown dog', 11,
  'Friendly small brown dog found near Pine Ave. No collar. Please message if yours.',
  NOW() + INTERVAL '5 days'
FROM topics t, users u
WHERE t.slug = 'lost-found'
  AND u.email = 'chuck@can.local'
LIMIT 1;


-- 8️⃣ General Discussion
INSERT INTO messages (topic_id, user_id, title, like_count, body, expires_at)
SELECT t.id, u.id, 
  'Anyone else hearing construction noise?', 5,
  'There has been loud construction starting around 6:30am this week. Anyone know what project this is?',
  NOW() + INTERVAL '20 days'
FROM topics t, users u
WHERE t.slug = 'nuisances'
  AND u.email = 'dave@can.local'
LIMIT 1;
