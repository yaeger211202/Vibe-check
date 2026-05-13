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
DROP TYPE IF EXISTS vibe_level_enum CASCADE;

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
    nominatim_id    BIGINT UNIQUE,
    name            VARCHAR(255) NOT NULL,
    address         TEXT,
    lat             DECIMAL(10,7) NOT NULL,
    lng             DECIMAL(10,7) NOT NULL,
    category_tags   TEXT[],
    radius_meters   DECIMAL(10,2) DEFAULT 1609.34,
    geom             GEOGRAPHY(POINT, 4326)
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
    expires_at   TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours'),
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
    reaction_id   SERIAL PRIMARY KEY,
    note_id       INT NOT NULL REFERENCES notes(note_id) ON DELETE CASCADE,
    user_id       INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('thumbs_up', 'thumbs_down')),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, note_id)
);

-- ========================
-- REPORTS
-- ========================
CREATE TABLE reports (
    report_id   SERIAL PRIMARY KEY,
    reporter_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL
        CHECK (target_type IN ('note', 'reply')),
    target_id   INT NOT NULL,
    reason      VARCHAR(50) NOT NULL
        CHECK (reason IN (
            'spam',
            'harassment',
            'misinformation',
            'inappropriate_content',
            'off_topic',
            'other'
        )),
    details     TEXT NOT NULL DEFAULT '',
    status      VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    -- One report per reporter per target; re-reporting upserts instead
    UNIQUE (reporter_id, target_type, target_id)
);

-- ========================
-- NOTIFICATIONS
-- ========================

CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id           INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    location_id       INT REFERENCES locations(location_id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title             VARCHAR(120) NOT NULL,
    message           TEXT NOT NULL,
    event_key         VARCHAR(255),
    is_read           BOOLEAN DEFAULT FALSE,
    created_at        TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, event_key)
);

-- ========================
-- NOTIFICATION INDEXES
-- ========================

CREATE INDEX idx_notifications_user_read
    ON notifications(user_id, is_read);

CREATE INDEX idx_notifications_created
    ON notifications(created_at DESC);

CREATE INDEX idx_notifications_location
    ON notifications(location_id);

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
    activity_score DECIMAL(5,2) CONSTRAINT chk_activity_score_range CHECK (activity_score >= 0 AND activity_score <= 100),
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

-- ========================
-- ADDITIONAL INDEXES
-- ========================
CREATE INDEX idx_locations_geom ON locations USING GIST (geom);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_notes_user_created ON notes(user_id, created_at);
CREATE INDEX idx_notes_expires_at ON notes(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_reactions_note ON reactions(note_id);
CREATE INDEX idx_replies_note ON replies(note_id);

-- Schema compatibility for existing databases that still have note categories
ALTER TABLE notes DROP COLUMN IF EXISTS category_tag;

-- ========================
-- CONSTRAINTS
-- ========================
ALTER TABLE locations ADD CONSTRAINT chk_lat_range CHECK (lat >= -90 AND lat <= 90);
ALTER TABLE locations ADD CONSTRAINT chk_lng_range CHECK (lng >= -180 AND lng <= 180);
ALTER TABLE user_profiles ADD CONSTRAINT chk_radius_positive CHECK (default_radius_km > 0);
ALTER TABLE locations ADD CONSTRAINT chk_radius_positive CHECK (radius_meters > 0);

ALTER TABLE friend_connections DROP CONSTRAINT friend_connections_user_id_1_user_id_2_key;
ALTER TABLE friend_connections ADD CONSTRAINT chk_user_order CHECK (user_id_1 < user_id_2);
