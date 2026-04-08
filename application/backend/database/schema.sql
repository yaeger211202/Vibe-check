-- Vibe Check Database Schema
-- Generated from EER Diagram v2.1
-- Updated to match M2 documentation

-- Enable PostGIS for geolocation
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS heatmap_activity CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS friend_connections CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS replies CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ========================
-- USERS
-- ========================
CREATE TABLE users (
    user_id                 SERIAL PRIMARY KEY,
    username                VARCHAR(50) NOT NULL UNIQUE,
    email                   VARCHAR(255) NOT NULL UNIQUE,
    password_hash           VARCHAR(255) NOT NULL,
    profile_picture_url     TEXT,
    account_status          VARCHAR(20) NOT NULL DEFAULT 'active',
    email_verified          BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token      VARCHAR(255),
    verification_sent_at    TIMESTAMP,
    verified_at             TIMESTAMP,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================
-- USER PROFILES
-- ========================
CREATE TABLE user_profiles (
    profile_id              SERIAL PRIMARY KEY,
    user_id                 INT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    default_radius_km       DECIMAL(6,2) DEFAULT 5.0,
    visibility              VARCHAR(20) DEFAULT 'public',
    notifications_enabled   BOOLEAN DEFAULT TRUE
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
    radius_meters   DECIMAL(10,2) DEFAULT 100.0
);

-- ========================
-- BLOCKS
-- ========================
CREATE TABLE blocks (
    block_id    SERIAL PRIMARY KEY,
    blocker_id  INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    blocked_id  INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (blocker_id, blocked_id),
    CHECK (blocker_id <> blocked_id)
);

-- ========================
-- NOTES
-- ========================
CREATE TYPE vibe_level_enum AS ENUM ('dead', 'quiet', 'moderate', 'busy', 'buzzing');

CREATE TABLE notes (
    note_id      SERIAL PRIMARY KEY,
    user_id      INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    location_id  INT NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
    content      TEXT NOT NULL CHECK (char_length(content) <= 280),
    vibe_level   vibe_level_enum NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    expires_at   TIMESTAMP,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for efficient vibe score aggregation and heatmap queries
CREATE INDEX idx_notes_location_expires ON notes(location_id, expires_at);

-- ========================
-- REPLIES
-- ========================
CREATE TABLE replies (
    reply_id     SERIAL PRIMARY KEY,
    note_id      INT NOT NULL REFERENCES notes(note_id) ON DELETE CASCADE,
    user_id      INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content      TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ========================
-- REACTIONS
-- ========================
CREATE TABLE reactions (
    reaction_id SERIAL PRIMARY KEY,
    note_id     INT NOT NULL REFERENCES notes(note_id) ON DELETE CASCADE,
    user_id     INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, note_id)
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
    COUNT(n.note_id) AS total_notes,
    ROUND(AVG(CASE n.vibe_level
        WHEN 'dead'     THEN 1
        WHEN 'quiet'    THEN 2
        WHEN 'moderate' THEN 3
        WHEN 'busy'     THEN 4
        WHEN 'buzzing'  THEN 5
    END)::NUMERIC, 2) AS avg_vibe_score
FROM locations l
LEFT JOIN notes n ON n.location_id = l.location_id
    AND (n.expires_at IS NULL OR n.expires_at > NOW())
GROUP BY l.location_id, l.name;
