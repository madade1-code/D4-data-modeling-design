import express from 'express';
import { pool } from '../db.js';
import { requireAuth, requireRole } from '../auth.js';

const router = express.Router();

// GET /api/attendance  -- list all attendance records
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name AS user_name, e.event_name
       FROM attendance a
       JOIN users u ON a.user_id = u.user_id
       JOIN events e ON a.event_id = e.event_id
       ORDER BY a.checked_in_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load attendance' });
  }
});

// POST /api/attendance  -- record attendance (officers/advisors/admins only)
router.post('/', requireAuth, requireRole('officer', 'advisor', 'admin'), async (req, res) => {
  const { user_id, event_id, attended } = req.body;
  if (!user_id || !event_id) {
    return res.status(400).json({ error: 'user_id and event_id are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO attendance (user_id, event_id, attended)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, event_id)
       DO UPDATE SET attended = EXCLUDED.attended, checked_in_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [user_id, event_id, attended]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record attendance' });
  }
});

export default router;