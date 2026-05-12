import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// GET /api/reports/users  -- list users (no passwords)
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.role, c.name AS club_name
       FROM users u
       LEFT JOIN clubs c ON u.club_id = c.club_id
       ORDER BY u.user_id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// GET /api/reports/summary  -- dashboard counts
router.get('/summary', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM events) AS total_events,
        (SELECT COUNT(*) FROM rsvps WHERE rsvp_status = 'Going') AS total_going,
        (SELECT COUNT(*) FROM attendance WHERE attended = TRUE) AS total_attended
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load summary' });
  }
});

export default router;