import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../auth.js';

const router = express.Router();

// GET /api/rsvps  -- list all RSVPs (public for now; tighten later)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name AS user_name, e.event_name
       FROM rsvps r
       JOIN users u ON r.user_id = u.user_id
       JOIN events e ON r.event_id = e.event_id
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load RSVPs' });
  }
});

// POST /api/rsvps  -- create or update your RSVP (any logged-in user)
// Uses ON CONFLICT so RSVPing twice just updates your status.
router.post('/', requireAuth, async (req, res) => {
  const { event_id, rsvp_status } = req.body;
  if (!event_id || !rsvp_status) {
    return res.status(400).json({ error: 'event_id and rsvp_status are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO rsvps (user_id, event_id, rsvp_status)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, event_id)
       DO UPDATE SET rsvp_status = EXCLUDED.rsvp_status
       RETURNING *`,
      [req.user.user_id, event_id, rsvp_status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit RSVP' });
  }
});

export default router;