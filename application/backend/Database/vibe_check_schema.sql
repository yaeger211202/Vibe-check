-- Vibe Check Database Schema
-- Generated from EER Diagram v2.1

-- Enable PostGIS for geolocation
CREATE EXTENSION IF NOT EXISTS postgis;

-- ========================
-- USERS
-- ========================
CREATE TABLE users (
    user_id       SERIAL PRIMARY KEY,
    username      VARCHAR(50) NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture_url TEXT,
    account_status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================
-- USER PROFILES
-- ========================
CREATE TABLE user_profiles (
    profile_id            SERIAL PRIMARY KEY,
    user_id               INT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    default_radius_km     DECIMAL(6,2) DEFAULT 5.0,
    visibility            VARCHAR(20) DEFAULT 'public',
    notifications_enabled BOOLEAN DEFAULT TRUE
);

-- ========================
-- LOCATIONS
-- ========================
CREATE TABLE locations (
    location_id     SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    address         TEXT,
    lat             DECIMAL(10,7) NOT NULL,
    lng             DECIMAL(10,7) NOT NULL,
    category_tags   TEXT[],
    avg_vibe_score  DECIMAL(3,2) GENERATED ALWAYS AS (avg_vibe_score) STORED
    -- avg_vibe_score is derived; compute via trigger or view
);

-- Use a view instead for derived avg_vibe_score
DROP TABLE IF EXISTS locations;
CREATE TABLE locations (
    location_id     SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    address         TEXT,
    lat             DECIMAL(10,7) NOT NULL,
    lng             DECIMAL(10,7) NOT NULL,
    category_tags   TEXT[]
);

-- ========================
-- NOTES
-- ========================
CREATE TABLE notes (
    note_id      SERIAL PRIMARY KEY,
    user_id      INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    location_id  INT NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
    content      TEXT NOT NULL,
    vibe_score   INT CHECK (vibe_score BETWEEN 1 AND 5),
    is_anonymous BOOLEAN DEFAULT FALSE,
    expires_at   TIMESTAMP,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================
-- REPLIES
-- ========================
CREATE TABLE replies (
    reply_id   SERIAL PRIMARY KEY,
    note_id    INT NOT NULL REFERENCES notes(note_id) ON DELETE CASCADE,
    user_id    INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================
-- REACTIONS
-- ========================
CREATE TABLE reactions (
    reaction_id SERIAL PRIMARY KEY,
    note_id     INT NOT NULL REFERENCES notes(note_id) ON DELETE CASCADE,
    user_id     INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (note_id, user_id)
);

-- ========================
-- NOTIFICATIONS
-- ========================
CREATE TABLE notifications (
    notification_id   SERIAL PRIMARY KEY,
    user_id           INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    is_read           BOOLEAN DEFAULT FALSE,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================
-- FRIEND CONNECTIONS
-- ========================
CREATE TABLE friend_connections (
    friendship_id SERIAL PRIMARY KEY,
    user_id_1     INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    user_id_2     INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status        VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id_1, user_id_2),
    CHECK (user_id_1 <> user_id_2)
);

-- ========================
-- BADGES
-- ========================
CREATE TABLE badges (
    badge_id                SERIAL PRIMARY KEY,
    badge_name              VARCHAR(100) NOT NULL UNIQUE,
    description             TEXT,
    requirement_threshold   INT NOT NULL
);

-- ========================
-- USER BADGES (junction)
-- ========================
CREATE TABLE user_badges (
    user_badge_id SERIAL PRIMARY KEY,
    user_id       INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    badge_id      INT NOT NULL REFERENCES badges(badge_id) ON DELETE CASCADE,
    earned_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, badge_id)
);

-- ========================
-- HEATMAP ACTIVITY
-- ========================
CREATE TABLE heatmap_activity (
    heatmap_id     SERIAL PRIMARY KEY,
    location_id    INT NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
    activity_score DECIMAL(5,2),
    time_window    VARCHAR(50),
    computed_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================
-- VIEW: avg_vibe_score per location
-- ========================
CREATE OR REPLACE VIEW location_vibe_scores AS
SELECT
    l.location_id,
    l.name,
    ROUND(AVG(n.vibe_score)::NUMERIC, 2) AS avg_vibe_score,
    COUNT(n.note_id) AS total_notes
FROM locations l
LEFT JOIN notes n ON n.location_id = l.location_id
GROUP BY l.location_id, l.name;
