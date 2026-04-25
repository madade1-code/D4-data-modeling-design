DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS rsvps;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    event_name VARCHAR(150),
    event_date DATE,
    event_location VARCHAR(150),
    created_by INT REFERENCES users(user_id)
);

CREATE TABLE rsvps (
    rsvp_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    event_id INT REFERENCES events(event_id),
    rsvp_status VARCHAR(50)
);

CREATE TABLE attendance (
    attendance_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    event_id INT REFERENCES events(event_id),
    attended BOOLEAN
);

INSERT INTO users (name, email, role) VALUES
('John Smith', 'john@umbc.edu', 'member'),
('Sarah Johnson', 'sarah@umbc.edu', 'member'),
('Michael Brown', 'michael@umbc.edu', 'officer');

INSERT INTO events (event_name, event_date, event_location, created_by) VALUES
('Welcome Event', '2026-04-10', 'Student Center', 3),
('Networking Night', '2026-04-20', 'Library Hall', 3);

INSERT INTO rsvps (user_id, event_id, rsvp_status) VALUES
(1, 1, 'Going'),
(2, 1, 'Going'),
(1, 2, 'Maybe');

INSERT INTO attendance (user_id, event_id, attended) VALUES
(1, 1, TRUE),
(2, 1, TRUE);
