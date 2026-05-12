import express from 'express';
import cors from 'cors';
import { register, login } from './auth.js';
import eventsRouter from './routes/events.js';
import rsvpsRouter from './routes/rsvps.js';
import attendanceRouter from './routes/attendance.js';
import reportsRouter from './routes/reports.js';

const app = express();

// Allow the frontend (different port) to call this API
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// Health check -- useful for "is the API up?"
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Auth routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// Resource routes
app.use('/api/events', eventsRouter);
app.use('/api/rsvps', rsvpsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/reports', reportsRouter);

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on port ${PORT}`));