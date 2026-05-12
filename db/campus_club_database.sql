-- Campus Club Event Management System
-- Schema: users, clubs, events, rsvps, attendance

-- Drop in reverse dependency order so foreign keys don't block us
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS rsvps;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS clubs;

-- ============================================
-- CLUBS: student organizations
-- ============================================
CREATE TABLE clubs (
    club_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USERS: students, officers, advisors, admins
-- ============================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    club_id INT REFERENCES clubs(club_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_role CHECK (role IN ('member', 'officer', 'advisor', 'admin'))
);

-- ============================================
-- EVENTS: club-hosted events
-- ============================================
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    club_id INT REFERENCES clubs(club_id) ON DELETE CASCADE,
    event_name VARCHAR(150) NOT NULL,
    event_date DATE NOT NULL,
    event_location VARCHAR(150),
    description TEXT,
    capacity INT,
    created_by INT REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- RSVPS: one row per (user, event)
-- ============================================
CREATE TABLE rsvps (
    rsvp_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    event_id INT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    rsvp_status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, event_id),
    CONSTRAINT valid_status CHECK (rsvp_status IN ('Going', 'Maybe', 'Not Going'))
);

-- ============================================
-- ATTENDANCE: one row per (user, event)
-- ============================================
CREATE TABLE attendance (
    attendance_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    event_id INT NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
    attended BOOLEAN NOT NULL DEFAULT FALSE,
    checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, event_id)
);

-- ============================================
-- INDEXES for common queries
-- ============================================
CREATE INDEX idx_events_club ON events(club_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_rsvps_event ON rsvps(event_id);
CREATE INDEX idx_attendance_event ON attendance(event_id);

-- ============================================
-- SEED DATA
-- Note: password_hash values below are PLACEHOLDERS.
-- Real users will be created through the API which hashes
-- passwords with bcrypt. Don't try to log in as these seed users.
-- ============================================

INSERT INTO clubs (name, description) VALUES
('UMBC Computing Club', 'Student organization for CS and IS majors'),
('UMBC Business Society', 'Networking and professional development');

INSERT INTO users (name, email, password_hash, role, club_id) VALUES
('John Smith',    'john@umbc.edu',    'PLACEHOLDER_HASH', 'member',  1),
('Sarah Johnson', 'sarah@umbc.edu',   'PLACEHOLDER_HASH', 'member',  1),
('Michael Brown', 'michael@umbc.edu', 'PLACEHOLDER_HASH', 'officer', 1);

INSERT INTO events (club_id, event_name, event_date, event_location, description, created_by) VALUES
(1, 'Welcome Event',    '2026-09-10', 'Student Center', 'Kick-off event for new members', 3),
(1, 'Networking Night', '2026-10-20', 'Library Hall',   'Meet industry professionals',    3);

INSERT INTO rsvps (user_id, event_id, rsvp_status) VALUES
(1, 1, 'Going'),
(2, 1, 'Going'),
(1, 2, 'Maybe');

INSERT INTO attendance (user_id, event_id, attended) VALUES
(1, 1, TRUE),
(2, 1, TRUE);