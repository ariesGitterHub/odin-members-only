-- Create default admin user (safe to re-run)

INSERT INTO users (
  email,
  password_hash,
  first_name,
  last_name,
  birthdate,
  permission_status,
  verified_by_admin,
  guest_upgrade_invite,
  invite_decision
)
VALUES 
  (
    'admin@can.org',
    '$2b$12$RF0Zoj3moNJOziNwh2bSa.DxlWqUSn0QZNnhYPDjCHjWyzagrsHD6',
    'Admin',
    '(CAN Board)',
    '1974-04-20',
    'admin',
    true,
    true,
    'accepted'
  )
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_profiles (
  user_id,   
  avatar_type,
  avatar_color_fg,
  avatar_color_bg_top,
  avatar_color_bg_bottom
)
SELECT u.id, '👑', '#FFD700', '#A50034', '#6A0DAD'
FROM users u
LEFT JOIN user_profiles p ON p.user_id = u.id
WHERE u.email = 'admin@can.org'
  AND p.user_id IS NULL;

-- App configurations (soft and hard deletes)
-- NOTE: Hard delete is counted from the time of soft delete, not from creation.
INSERT INTO app_config (key, value) VALUES
('message_soft_delete_days', '14'),
('message_hard_delete_days', '14'),
('session_soft_delete_days', '7'),
('session_hard_delete_days', '28');

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
  ('lost-found', 'Lost and Found', 'Lost and found for items or pets', 'guest', 80),
  ('buy-sell', 'Buy and Sell', 'Items for sale, or items wanted', 'guest', 90),
  ('free-stuff', 'Free Stuff', 'Get rid of your material burdens', 'guest', 100),
  ('businesses', 'Local Businesses', 'Recommendations for local services and restaurants', 'guest', 110),
  ('introductions', 'Introductions', 'Welcome new neighbors', 'guest', 120),
  ('feedback', 'Feedback', 'Suggestions to improve this site', 'guest', 130),
  ('members-only', 'Members Only', 'Messages visible only to members', 'member', 140),
  ('admin-notes', 'Admin Notes', 'Boring admin stuff', 'admin', 150)
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
  verified_by_admin,
  guest_upgrade_invite,
  invite_decision
)
VALUES
  ('ace@can.org',  '$2b$12$Gl7T7yZkulLKRidN9z58sOKmw0tTdTSpa7tYd4YtZNLpstRE/MYcy', 'Ace',  'Ampere', '1975-01-20', 'guest', true, true, 'none'), 
  ('bea@can.org',  '$2b$12$Gl7T7yZkulLKRidN9z58sOKmw0tTdTSpa7tYd4YtZNLpstRE/MYcy', 'Bea',  'Billings', '1976-02-20', 'guest', true, true, 'declined'), 
  ('che@can.org',  '$2b$12$Gl7T7yZkulLKRidN9z58sOKmw0tTdTSpa7tYd4YtZNLpstRE/MYcy', 'Che',  'Chessex', '1977-03-20', 'guest', true, false, 'none'), 
  ('dee@can.org',  '$2b$12$Gl7T7yZkulLKRidN9z58sOKmw0tTdTSpa7tYd4YtZNLpstRE/MYcy', 'Dee',  'Delozier', '1978-04-20', 'guest', false, false, 'none'), 
  ('eve@can.org',  '$2b$12$Gl7T7yZkulLKRidN9z58sOKmw0tTdTSpa7tYd4YtZNLpstRE/MYcy', 'Eve',  'Everett', '1979-05-20', 'guest', false, false, 'none'), 
  ('alan@can.org',  '$2b$12$Gl7T7yZkulLKRidN9z58sOKmw0tTdTSpa7tYd4YtZNLpstRE/MYcy', 'Alan',  'Rivera', '1961-01-05', 'guest', true, false, 'none'),
  ('brad@can.org', '$2b$12$Gl7T7yZkulLKRidN9z58sOKmw0tTdTSpa7tYd4YtZNLpstRE/MYcy', 'Brad', 'Chen', '1951-04-05', 'member', true, true, 'accepted'),
  ('chet@can.org', '$2b$12$Gl7T7yZkulLKRidN9z58sOKmw0tTdTSpa7tYd4YtZNLpstRE/MYcy', 'Chet', 'Thompson', '1941-08-05', 'member', true, true, 'accepted'),
  ('dave@can.org',  '$2b$12$Gl7T7yZkulLKRidN9z58sOKmw0tTdTSpa7tYd4YtZNLpstRE/MYcy', 'Dave',  'Brooks', '1951-10-05', 'member', true, true, 'accepted'),
  ('evil@can.org',  '$2b$12$Gl7T7yZkulLKRidN9z58sOKmw0tTdTSpa7tYd4YtZNLpstRE/MYcy', 'Evil',  'Hater', '1966-06-05', 'guest', false, false, 'none'),
  ('zee@can.org',  '$2b$12$Gl7T7yZkulLKRidN9z58sOKmw0tTdTSpa7tYd4YtZNLpstRE/MYcy', 'Zee',  'Bee', '1925-08-05', 'member', true, true, 'accepted')
ON CONFLICT (email) DO NOTHING;


-- =====================================================
-- USER PROFILES
-- =====================================================

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
  notes
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
  v.notes
FROM users u

LEFT JOIN (
  VALUES
    ('ace@can.org', 'A', '', '', '',  '', '', '', '', '', ''),
    ('bea@can.org', 'B', '', '', '',  '', '', '', '', '', ''),
    ('che@can.org', 'C', '', '', '',  '', '', '', '', '', ''),
    ('dee@can.org', 'D', '', '', '',  '', '', '', '', '', ''),
    ('eve@can.org', 'E', '', '', '',  '', '', '', '', '', ''),
    ('alan@can.org', 'A', '', '', '#997a98',  '', '', '', '', '', ''),
    ('brad@can.org', 'B', '', '#a91313', '',  '', '', '', '', '', ''),
    ('chet@can.org', '🦍', '', '#92cfe4', '#7de9e9',  '555-111-2222', '123 Maple St', 'Harrisburg', 'PA', '17102', 'Likes peanut brittle; watches squirrels in the park on hot summer days.'),
    ('dave@can.org', '🦙', '#521313', '#eeee7d', '#83741d', '555-333-4444', '456 Oak Ave',  'Harrisburg', 'PA', '17101', ''),
    ('evil@can.org', 'E', '#2b0505', '#bfbf0c', '#1d2c83', '555-313-4444', '45 Nope Ave',  'Harrisburg', 'PA', '17101', ''),
    ('zee@can.org', '🐝', '#1f1e1d', '#dddd16', '#d7d70d', '555-666-4444', '123 Yikes Lane',  'Harrisburg', 'PA', '17102', 'Owns a bee hive.')
) AS v(email, avatar_type, avatar_color_fg, avatar_color_bg_top, avatar_color_bg_bottom, phone, street_address, city, us_state, zip_code, notes)
ON u.email = v.email

LEFT JOIN user_profiles p ON p.user_id = u.id

WHERE u.email IN (
  'ace@can.org',
  'bea@can.org',
  'che@can.org',
  'dee@can.org',
  'eve@can.org',
  'alan@can.org',
  'brad@can.org',
  'chet@can.org',
  'dave@can.org',
  'evil@can.org',
  'zee@can.org'
)
AND p.user_id IS NULL;



-- =====================================================
-- DUMMY MESSAGES
-- =====================================================


-- 1️⃣ Introductions
INSERT INTO messages (topic_id, user_id, title, body)
SELECT t.id, u.id,
  'Hello from Alan',
  'Hi everyone, just moved to the neighborhood last week. Looking forward to meeting you all!'
FROM topics t, users u
WHERE t.slug = 'introductions'
  AND u.email = 'alan@can.org'
LIMIT 1;


-- 2️⃣ Safety Alert
INSERT INTO messages (topic_id, user_id, title, body)
SELECT t.id, u.id,
  'Car break-ins reported on Maple St.',
  'Just a heads up — two cars were broken into overnight near Maple and 3rd. Please remember to lock your vehicles.'
FROM topics t, users u
WHERE t.slug = 'safety-alerts'
  AND u.email = 'bruce@can.org'
LIMIT 1;


-- 3️⃣ Buy & Sell
INSERT INTO messages (topic_id, user_id, title, body)
SELECT t.id, u.id,
  'Bike for sale - $75', 
  'Selling a lightly used mountain bike. 26-inch wheels, great condition. Reply if interested.'
FROM topics t, users u
WHERE t.slug = 'buy-sell'
  AND u.email = 'chet@can.org'
LIMIT 1;

-- 3️⃣ Buy & Sell
INSERT INTO messages (topic_id, user_id, title, body)
SELECT t.id, u.id,
  'Old silverware.',
  'I''m moving and need to downsize. This was my grandmother''s old mixed box of forks, knives, spoons, and some other bits I don''t know the names of. make me an offer.' 
FROM topics t, users u
WHERE t.slug = 'buy-sell'
  AND u.email = 'evil@can.org'
LIMIT 1;

-- 3️⃣ Buy & Sell
INSERT INTO messages (topic_id, user_id, title, body)
SELECT t.id, u.id,
  'Comic Books.',
  'Throwing out a box of old comic books left behind by a prior renter, YOURS FOR A DOLLAR!' 
FROM topics t, users u
WHERE t.slug = 'buy-sell'
  AND u.email = 'chet@can.org'
LIMIT 1;


-- 4️⃣ Free Stuff
INSERT INTO messages (topic_id, user_id, title, body)
SELECT t.id, u.id, 
  'Free moving boxes',
  'Just finished moving — have about 20 boxes in good shape. Free for pickup.'
FROM topics t, users u
WHERE t.slug = 'free-stuff'
  AND u.email = 'dave@can.org'
LIMIT 1;


-- 5️⃣ Help Request
INSERT INTO messages (topic_id, user_id, title, body)
SELECT t.id, u.id, 
  'Need recommendation for plumber',
  'Can anyone recommend a reliable plumber for a small kitchen leak?'
FROM topics t, users u
WHERE t.slug = 'help-requests'
  AND u.email = 'alan@can.org'
LIMIT 1;


-- 6️⃣ Event
INSERT INTO messages (topic_id, user_id, title, body)
SELECT t.id, u.id,
  'Neighborhood BBQ this Saturday',
  'Planning a casual BBQ at Riverside Park at 4pm. Bring something to share!'
FROM topics t, users u
WHERE t.slug = 'events'
  AND u.email = 'bruce@can.org'
LIMIT 1;


-- 7️⃣ Lost & Found
INSERT INTO messages (topic_id, user_id, title, body)
SELECT t.id, u.id, 
  'Found: small brown dog',
  'Small, friendly, brown dog found near Pine Ave. No collar. Please reply if yours.'
FROM topics t, users u
WHERE t.slug = 'lost-found'
  AND u.email = 'chet@can.org'
LIMIT 1;


-- 8️⃣ General Discussion
INSERT INTO messages (topic_id, user_id, title, body)
SELECT t.id, u.id, 
  'Anyone else hearing construction noise?',
  'There has been loud construction starting around 5:30am this week. Anyone know what project this is?'
FROM topics t, users u
WHERE t.slug = 'nuisances'
  AND u.email = 'dave@can.org'
LIMIT 1;
