-- Create default admin user (safe to re-run)

INSERT INTO users (
  email,
  password_hash,
  first_name,
  last_name,
  birthdate,
  permission_status,
  member_request
)
VALUES (
  'admin@can.org',
  '$2b$12$RF0Zoj3moNJOziNwh2bSa.DxlWqUSn0QZNnhYPDjCHjWyzagrsHD6',
  'CAN Board Admin',
  '#1',
  '1974-04-20',
  'admin',
  true
)
ON CONFLICT (email) DO NOTHING;

-- Ensure admin has a profile and is verified

INSERT INTO user_profiles (
  user_id,   
  avatar_type,
  avatar_color_bg_top,
  avatar_color_bg_bottom,
  verified_by_admin
)
SELECT u.id, '👑', '#d080eb', '#864e97', true
FROM users u
LEFT JOIN user_profiles p ON p.user_id = u.id
WHERE u.email = 'admin@can.org'
  AND p.user_id IS NULL;

-- Seed default topics (safe to re-run)

INSERT INTO topics (slug, name, description, sort_order)
VALUES
  ('announcements', 'Announcements', 'Important updates and notices', 0),
  ('safety-alerts', 'Safety Alerts', 'Crime and suspicious activity', 10),
  ('events', 'Events', 'Neighborhood meetings and activities', 20),
  ('general', 'General Discussion', 'Neighborhood conversations', 30),
  ('harrisburg', 'Harrisburg', 'All things city and governance', 40),
  ('parking', 'Parking', 'Citywide and neighborhood parking', 50),
  ('nuisances', 'Nuisances', 'Noise, vandalism, and irritations', 60),
  ('help-requests', 'Help Requests', 'Ask neighbors for assistance', 70),
  ('lost-found', 'Lost and Found', 'Lost and found for items or pets', 80),
  ('buy-sell', 'Buy and Sell', 'Items for sale, or items wanted', 90),
  ('free-stuff', 'Free Stuff', 'Get rid of your material burdens', 100),
  ('businesses', 'Local Businesses', 'Recommendations for local services and restaurants', 110),
  ('introductions', 'Introductions', 'Welcome new neighbors', 120),
  ('feedback', 'Feedback', 'Suggestions to improve this site', 130),
  ('members-only', 'Members Only', 'Messages visible only to members', 140)
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
  permission_status,
  member_request
)
VALUES
  ('alan@can.org',  '$2b$12$Gl7T7yZkulLKRidN9z58sOKmw0tTdTSpa7tYd4YtZNLpstRE/MYcy', 'Alan',  'Rivera', '1961-01-05', 'guest', true),
  ('bruce@can.org', '$2b$12$Gl7T7yZkulLKRidN9z58sOKmw0tTdTSpa7tYd4YtZNLpstRE/MYcy', 'Bruce', 'Chen', '1951-04-05', 'guest', false),
  ('chuck@can.org', '$2b$12$Gl7T7yZkulLKRidN9z58sOKmw0tTdTSpa7tYd4YtZNLpstRE/MYcy', 'Chuck', 'Thompson', '1941-08-05', 'member', true),
  ('dave@can.org',  '$2b$12$Gl7T7yZkulLKRidN9z58sOKmw0tTdTSpa7tYd4YtZNLpstRE/MYcy', 'Dave',  'Brooks', '1951-10-05', 'member', true),
  ('evil@can.org',  '$2b$12$Gl7T7yZkulLKRidN9z58sOKmw0tTdTSpa7tYd4YtZNLpstRE/MYcy', 'Evil',  'Hater', '1966-06-05', 'guest', false),
  ('ace@can.org',  '$2b$12$Gl7T7yZkulLKRidN9z58sOKmw0tTdTSpa7tYd4YtZNLpstRE/MYcy', 'Ace',  'One', '1982-04-01', 'member', true)
ON CONFLICT (email) DO NOTHING;


-- =====================================================
-- USER PROFILES
-- =====================================================

-- INSERT INTO user_profiles (user_id, verified_by_admin)
-- SELECT u.id, true
-- FROM users u
-- LEFT JOIN user_profiles p ON p.user_id = u.id
-- WHERE u.email IN (
--   'alan@can.org',
--   'bruce@can.org',
--   'chuck@can.org',
--   'dave@can.org'
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
  notes,
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
  v.notes,
  v.verified_by_admin
FROM users u

LEFT JOIN (
  VALUES
    ('alan@can.org', '', '', '', '#997a98',  '', '', '', '', '', '', false),
    ('bruce@can.org', '', '', '#a91313', '',  '', '', '', '', '', '', true),
    ('chuck@can.org', '🦍', '', '#92cfe4', '#7de9e9',  '555-111-2222', '123 Maple St', 'Harrisburg', 'PA', '17102', 'likes peanut brittle and has been known to watch squirrels in the park on hot summer days', true),
    ('dave@can.org', '🦙', '#521313', '#eeee7d', '#83741d', '555-333-4444', '456 Oak Ave',  'Harrisburg', 'PA', '17101', '', true),
    ('evil@can.org', '', '#2b0505', '#bfbf0c', '#1d2c83', '555-313-4444', '45 Nope Ave',  'Harrisburg', 'PA', '17101', '', false),
    ('ace@can.org', 'A', '', '', '', '', '',  '', '', '', '', true)
) AS v(email, avatar_type, avatar_color_fg, avatar_color_bg_top, avatar_color_bg_bottom, phone, street_address, city, us_state, zip_code, notes, verified_by_admin)
ON u.email = v.email

LEFT JOIN user_profiles p ON p.user_id = u.id

WHERE u.email IN (
  'alan@can.org',
  'bruce@can.org',
  'chuck@can.org',
  'dave@can.org',
  'evil@can.org',
  'ace@can.org'
)
AND p.user_id IS NULL;



-- =====================================================
-- DUMMY MESSAGES
-- =====================================================


-- 1️⃣ Introductions
INSERT INTO messages (topic_id, user_id, title, like_count, reply_count, body, expires_at)
SELECT t.id, u.id,
  'Hello from Alan', 7, 0,
  'Hi everyone, just moved to the neighborhood last week. Looking forward to meeting you all!',
  NOW() + INTERVAL '30 days'
FROM topics t, users u
WHERE t.slug = 'introductions'
  AND u.email = 'alan@can.org'
LIMIT 1;


-- 2️⃣ Safety Alert
INSERT INTO messages (topic_id, user_id, title, like_count, reply_count, body, expires_at)
SELECT t.id, u.id,
  'Car break-ins reported on Maple St.', 9, 0,
  'Just a heads up — two cars were broken into overnight near Maple and 3rd. Please remember to lock your vehicles.',
  NOW() + INTERVAL '14 days'
FROM topics t, users u
WHERE t.slug = 'safety-alerts'
  AND u.email = 'bruce@can.org'
LIMIT 1;


-- 3️⃣ Buy & Sell
INSERT INTO messages (topic_id, user_id, title, like_count, reply_count, body, expires_at)
SELECT t.id, u.id,
  'Bike for sale - $75',  1, 1,
  'Selling a lightly used mountain bike. 26-inch wheels, great condition. DM if interested.',
  NOW() + INTERVAL '30 days'
FROM topics t, users u
WHERE t.slug = 'buy-sell'
  AND u.email = 'chuck@can.org'
LIMIT 1;

-- 3️⃣ Buy & Sell
INSERT INTO messages (topic_id, user_id, title, like_count, reply_count, body, expires_at)
SELECT t.id, u.id,
  'MONKEY for sale that i found while washing dishes in a car park vestibule and it said hi but don''t tell anyone I speak - $5',  1, 2,
  'Slightly bitey, great condition. DM if interested.',
  NOW() + INTERVAL '30 days'
FROM topics t, users u
WHERE t.slug = 'buy-sell'
  AND u.email = 'evil@can.org'
LIMIT 1;

-- 3️⃣ Buy & Sell
INSERT INTO messages (topic_id, user_id, title, like_count, reply_count, body, expires_at)
SELECT t.id, u.id,
  'POOP!',  1, 3,
  'Angry pooping.',
  NOW() + INTERVAL '30 days'
FROM topics t, users u
WHERE t.slug = 'buy-sell'
  AND u.email = 'chuck@can.org'
LIMIT 1;


-- 4️⃣ Free Stuff
INSERT INTO messages (topic_id, user_id, title, like_count, reply_count, body, expires_at)
SELECT t.id, u.id, 
  'Free moving boxes', 2, 0,
  'Just finished moving — have about 20 boxes in good shape. Free for pickup.',
  NOW() + INTERVAL '10 days'
FROM topics t, users u
WHERE t.slug = 'free-stuff'
  AND u.email = 'dave@can.org'
LIMIT 1;


-- 5️⃣ Help Request
INSERT INTO messages (topic_id, user_id, title, like_count, reply_count, body, expires_at)
SELECT t.id, u.id, 
  'Need recommendation for plumber', 0, 0,
  'Can anyone recommend a reliable plumber for a small kitchen leak?',
  NOW() + INTERVAL '15 days'
FROM topics t, users u
WHERE t.slug = 'help-requests'
  AND u.email = 'alan@can.org'
LIMIT 1;


-- 6️⃣ Event
INSERT INTO messages (topic_id, user_id, title, like_count, reply_count, body, expires_at)
SELECT t.id, u.id,
  'Neighborhood BBQ this Saturday', 20, 0,
  'Planning a casual BBQ at Riverside Park at 4pm. Bring something to share!',
  NOW() + INTERVAL '7 days'
FROM topics t, users u
WHERE t.slug = 'events'
  AND u.email = 'bruce@can.org'
LIMIT 1;


-- 7️⃣ Lost & Found
INSERT INTO messages (topic_id, user_id, title, like_count, reply_count, body, expires_at)
SELECT t.id, u.id, 
  'Found: small brown dog', 11, 0,
  'Friendly small brown dog found near Pine Ave. No collar. Please message if yours.',
  NOW() + INTERVAL '5 days'
FROM topics t, users u
WHERE t.slug = 'lost-found'
  AND u.email = 'chuck@can.org'
LIMIT 1;


-- 8️⃣ General Discussion
INSERT INTO messages (topic_id, user_id, title, like_count, reply_count, body, expires_at)
SELECT t.id, u.id, 
  'Anyone else hearing construction noise?', 5, 0,
  'There has been loud construction starting around 6:30am this week. Anyone know what project this is?',
  NOW() + INTERVAL '20 days'
FROM topics t, users u
WHERE t.slug = 'nuisances'
  AND u.email = 'dave@can.org'
LIMIT 1;
