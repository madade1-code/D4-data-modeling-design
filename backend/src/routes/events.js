import express from 'express';
import { pool } from '../db.js';
import { requireAuth, requireRole } from '../auth.js';

const router = express.Router();

// GET /api/events  -- list all events (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, c.name AS club_name, u.name AS creator_name
       FROM events e
       LEFT JOIN clubs c ON e.club_id = c.club_id
       LEFT JOIN users u ON e.created_by = u.user_id
       ORDER BY e.event_date DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load events' });
  }
});

// GET /api/events/:id  -- get one event (public)
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events WHERE event_id = $1',
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Event not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load event' });
  }
});

// POST /api/events  -- create event (officers, advisors, admins only)
router.post('/', requireAuth, requireRole('officer', 'advisor', 'admin'), async (req, res) => {
  const { club_id, event_name, event_date, event_location, description, capacity } = req.body;
  if (!event_name || !event_date) {
    return res.status(400).json({ error: 'event_name and event_date are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO events (club_id, event_name, event_date, event_location, description, capacity, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [club_id, event_name, event_date, event_location, description, capacity, req.user.user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

export default router;